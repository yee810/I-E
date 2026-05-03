import { GoogleGenAI } from "@google/genai";
import { ENV } from "../config/env.ts";
import { parsePdf } from "../utils/pdf.ts";

const ai = ENV.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY }) : null;

export interface ParsedCV {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  education: Array<{ school: string; degree: string; field?: string; start?: string; end?: string }>;
  experience: Array<{ title: string; company: string; start?: string; end?: string; bullets?: string[] }>;
  skills: string[];
  summary?: string;
  rawResumeText?: string;
}

const parsePrompt = `You are a CV parser. Extract structured information from the resume text below and return as JSON.
Schema:
{
  "name": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "education": [{"school": "...", "degree": "...", "field": "...", "start": "...", "end": "..."}],
  "experience": [{"title": "...", "company": "...", "start": "...", "end": "...", "bullets": ["..."]}],
  "skills": ["..."],
  "summary": "string or null"
}
Constraints:
- Do not add any keys outside this schema.
- Return ONLY valid JSON. No markdown, no commentary.
Resume text:`;

export async function parseCVFromBuffer(buffer: Buffer): Promise<ParsedCV> {
  let rawText = "";
  try {
    rawText = (await parsePdf(buffer)).text;
  } catch (e) {
    rawText = buffer.toString("utf-8");
  }

  if (!ai) {
    return fallbackParse(rawText);
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-thinking-exp",
    contents: [{ role: "user", parts: [{ text: parsePrompt + "\n\n" + rawText }] }],
  });

  const text = response.text || "";
  let parsed: ParsedCV | undefined;
  try {
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    parsed = JSON.parse(clean) as ParsedCV;
  } catch {
    parsed = undefined;
  }

  if (!parsed) {
    return fallbackParse(rawText);
  }

  return { ...parsed, rawResumeText: rawText };
}

function fallbackParse(rawText: string): ParsedCV {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  return {
    name: lines[0] || "Unknown",
    email: null as any,
    education: [],
    experience: [],
    skills: [],
    rawResumeText: rawText,
  };
}
