import { GoogleGenAI } from "@google/genai";
import { ENV } from "../config/env.ts";
import type { MatchResult } from "./matchingEngine.ts";

const ai = ENV.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY }) : null;

/**
 * Generate a human-readable rationale for a single job match.
 */
export async function generateRationale(
  userText: string,
  job: any
): Promise<string> {
  if (!ai) {
    return `Based on your profile, ${job.title} at ${job.company} could be a good fit.`;
  }
  const prompt = `Explain in one friendly sentence why this job is a good match for the candidate.
Candidate: ${userText}
Job: ${job.title} at ${job.company}. ${job.description ?? ""}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-thinking-exp",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return (response.text || "").trim() || "A strong match based on your skills and preferences.";
  } catch {
    return `Based on your profile, ${job.title} at ${job.company} looks like a strong match.`;
  }
}
