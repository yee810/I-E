import { openai } from "./openaiClient.ts";
import { ENV } from "../config/env.ts";
import { parsePdf } from "../utils/pdf.ts";

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
  targetRoles?: string[];
  targetIndustry?: string;
  expectedSalary?: number;
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
  "summary": "string or null",
  "targetRoles": ["string or null - job positions the candidate is seeking, e.g. 投行分析师、前端开发、市场专员"],
  "targetIndustry": "string or null - industry the candidate wants to work in, e.g. fintech、科技、咨询",
  "expectedSalary": "number or null - monthly salary expectation in CNY (RMB), only if explicitly stated in the resume"
}
Constraints:
- Do not add any keys outside this schema.
- targetRoles: extract from sections like 求职意向、期望职位、Objective, Target Position etc. Return as array of strings.
- targetIndustry: extract from sections like 期望行业、目标行业, Industry Preference etc.
- expectedSalary: only extract if the resume explicitly states a salary/compensation expectation. Convert to monthly CNY number. If annual, divide by 12.
- Return ONLY valid JSON. No markdown, no commentary.
Resume text:`;

export interface CVParseResult {
  parsed: ParsedCV;
  method: "llm" | "fallback";
  error?: string;
}

export async function parseCVFromBuffer(buffer: Buffer): Promise<CVParseResult> {
  let rawText = "";
  try {
    rawText = (await parsePdf(buffer)).text;
  } catch (e) {
    rawText = buffer.toString("utf-8");
  }

  if (!rawText || rawText.trim().length < 20) {
    return {
      parsed: { name: "Unknown", education: [], experience: [], skills: [], rawResumeText: rawText },
      method: "fallback",
      error: "PDF text extraction failed or file is empty",
    };
  }

  if (!openai) {
    return { parsed: fallbackParse(rawText), method: "fallback", error: "AI service unavailable, using keyword extraction" };
  }

  try {
    const response = await openai.chat.completions.create({
      model: ENV.OPENAI_CV_MODEL,
      messages: [{ role: "user", content: parsePrompt + "\n\n" + rawText.slice(0, 8000) }],
      max_tokens: 2000,
    });

    const text = response.choices[0]?.message?.content || "";
    let parsed: ParsedCV | undefined;
    try {
      const clean = text
        .replace(/<think >[\s\S]*?<\/think>/g, "")
        .replace(/<think >[\s\S]*$/g, "")
        .replace(/^\s*<\/think>\s*/gm, "")
        .replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(clean) as ParsedCV;
    } catch (jsonErr) {
      const nameMatch = text.match(/"name"\s*:\s*"([^"]+)"/);
      const emailMatch = text.match(/"email"\s*:\s*"([^"]+)"/);
      const skillsMatch = text.match(/"skills"\s*:\s*\[([\s\S]*?)\]/);
      const targetRolesMatch = text.match(/"targetRoles"\s*:\s*\[([\s\S]*?)\]/);
      const targetIndustryMatch = text.match(/"targetIndustry"\s*:\s*"([^"]+)"/);
      const salaryMatch = text.match(/"expectedSalary"\s*:\s*(\d+)/);
      if (nameMatch) {
        const skills: string[] = [];
        if (skillsMatch) {
          skillsMatch[1].replace(/"([^"]+)"/g, (_, s) => { skills.push(s); return ""; });
        }
        const targetRoles: string[] = [];
        if (targetRolesMatch) {
          targetRolesMatch[1].replace(/"([^"]+)"/g, (_, s) => { targetRoles.push(s); return ""; });
        }
        parsed = {
          name: nameMatch[1],
          email: emailMatch?.[1],
          education: [],
          experience: [],
          skills,
          rawResumeText: rawText,
          targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
          targetIndustry: targetIndustryMatch?.[1] || undefined,
          expectedSalary: salaryMatch ? Number(salaryMatch[1]) : undefined,
        };
        console.log("[CV Parse] Salvaged partial JSON: name=", parsed.name, "skills=", skills.length);
      } else {
        console.error("[CV Parse] JSON parse failed:", (jsonErr as Error).message, "Raw:", text.slice(0, 300));
        parsed = undefined;
      }
    }

    if (parsed) {
      if (!parsed.name || parsed.name === "null") {
        const fb = fallbackParse(rawText);
        parsed.name = fb.name;
      }
      if (!parsed.skills || parsed.skills.length === 0) {
        const fb = fallbackParse(rawText);
        parsed.skills = fb.skills;
      }
      if (!parsed.targetRoles || parsed.targetRoles.length === 0) {
        const fb = fallbackParse(rawText);
        if (fb.targetRoles && fb.targetRoles.length > 0) parsed.targetRoles = fb.targetRoles;
      }
      if (!parsed.targetIndustry) {
        const fb = fallbackParse(rawText);
        if (fb.targetIndustry) parsed.targetIndustry = fb.targetIndustry;
      }
      if (!parsed.expectedSalary) {
        const fb = fallbackParse(rawText);
        if (fb.expectedSalary) parsed.expectedSalary = fb.expectedSalary;
      }
      parsed.rawResumeText = rawText;
      return { parsed, method: "llm" };
    }

    return { parsed: fallbackParse(rawText), method: "fallback", error: "AI returned invalid JSON, using keyword extraction" };
  } catch (llmErr: any) {
    console.error("[CV Parse] LLM error:", llmErr.message || llmErr);
    return { parsed: fallbackParse(rawText), method: "fallback", error: `AI error: ${llmErr.message || "unknown"}` };
  }
}

function fallbackParse(rawText: string): ParsedCV {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  const text = rawText.toLowerCase();

  const TITLE_PATTERNS = /^(个人简历|简历|resume|cv|curriculum vitae)/i;
  let name = "Unknown";
  for (const line of lines.slice(0, 5)) {
    if (TITLE_PATTERNS.test(line)) continue;
    if (line.length > 20) continue;
    if (/^[一-鿿]{2,4}$/.test(line)) { name = line; break; }
    if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(line)) { name = line; break; }
  }
  const nameRegex = rawText.match(/(?:姓名|名字|Name)\s*[：:]\s*([^\n,，]{2,10})/);
  if (nameRegex) name = nameRegex[1].trim();

  const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/);

  const SKILL_KEYWORDS = [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin",
    "react", "vue", "angular", "node", "express", "django", "flask", "spring", "rails",
    "html", "css", "sass", "tailwind", "bootstrap",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd",
    "git", "linux", "agile", "scrum", "jira",
    "machine learning", "deep learning", "nlp", "computer vision", "data science",
    "figma", "sketch", "photoshop", "illustrator",
    "excel", "powerpoint", "word", "tableau", "power bi",
    "marketing", "sales", "finance", "accounting", "consulting",
    "communication", "leadership", "teamwork", "problem solving",
    "前端", "后端", "全栈", "数据分析", "产品经理", "设计", "运营", "市场",
    "金融", "会计", "咨询", "投行", "量化", "风控",
    "行政管理", "人力资源", "项目管理", "客户服务",
  ];
  const skills = SKILL_KEYWORDS.filter(kw => text.includes(kw));

  // Extract target roles from 求职意向 section
  const targetRoles: string[] = [];
  const rolePatterns = [
    /(?:求职意向|期望职位|意向职位|目标职位|Objective|Target\s*Position|Career\s*Objective)[：:\s]*\n?([^\n]+)/i,
    /(?:期望岗位|意向岗位|应聘职位|应聘岗位)[：:\s]*\n?([^\n]+)/i,
  ];
  for (const pat of rolePatterns) {
    const m = rawText.match(pat);
    if (m) {
      const roles = m[1].split(/[,，、/|]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 20);
      targetRoles.push(...roles);
      break;
    }
  }

  // Extract target industry
  let targetIndustry: string | undefined;
  const industryPatterns = [
    /(?:期望行业|目标行业|意向行业|行业偏好)[：:\s]*\n?([^\n,，]+)/i,
    /(?:Industry)\s*(?:Preference)?[：:\s]*\n?([^\n,，]+)/i,
  ];
  for (const pat of industryPatterns) {
    const m = rawText.match(pat);
    if (m && m[1].trim().length > 0 && m[1].trim().length < 30) {
      targetIndustry = m[1].trim();
      break;
    }
  }

  // Map Chinese industry names to system values
  const INDUSTRY_MAP: Record<string, string> = {
    "金融科技": "fintech", "fintech": "fintech",
    "咨询": "consulting", "consulting": "consulting",
    "科技": "technology", "互联网": "technology", "技术": "technology", "technology": "technology",
    "银行": "banking", "banking": "banking",
    "医疗": "healthcare", "healthcare": "healthcare",
  };
  if (targetIndustry) {
    const lower = targetIndustry.toLowerCase();
    for (const [key, val] of Object.entries(INDUSTRY_MAP)) {
      if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
        targetIndustry = val;
        break;
      }
    }
  }

  // Extract expected salary
  let expectedSalary: number | undefined;
  const salaryPatterns = [
    /(?:期望薪资|期望薪酬|薪资要求|月薪期望|薪资意向|Expected\s*Salary|Salary\s*Expectation)[：:\s]*\n?[￥¥$]?\s*(\d[\d,，.]*)(?:\s*[~-—–至]\s*[￥¥$]?\s*(\d[\d,，.]*))?\s*(?:元|块|CNY|RMB|\/月|monthly|per\s*month)?/i,
    /(?:期望薪资|期望薪酬|薪资要求|月薪期望|薪资意向)[：:\s]*\n?(\d[\d,，.]*)\s*[~-—–至]\s*(\d[\d,，.]*)/i,
  ];
  for (const pat of salaryPatterns) {
    const m = rawText.match(pat);
    if (m) {
      const parseNum = (s: string) => Number(s.replace(/[,，]/g, ""));
      const low = parseNum(m[1]);
      const high = m[2] ? parseNum(m[2]) : low;
      const avg = Math.round((low + high) / 2);
      if (avg > 0 && avg < 1000000) {
        // If number seems like annual (e.g. > 100000), convert to monthly
        expectedSalary = avg > 100000 ? Math.round(avg / 12) : avg;
        break;
      }
    }
  }
  // Also try patterns like "8k-12k" or "8K"
  if (!expectedSalary) {
    const kMatch = rawText.match(/(\d+)\s*[kK]\s*[~-—–至]?\s*(?:(\d+)\s*[kK])?/);
    if (kMatch) {
      const low = Number(kMatch[1]) * 1000;
      const high = kMatch[2] ? Number(kMatch[2]) * 1000 : low;
      expectedSalary = Math.round((low + high) / 2);
    }
  }
  // Snap salary to nearest 1000 for the slider (0-30000 range)
  if (expectedSalary) {
    expectedSalary = Math.min(30000, Math.max(0, Math.round(expectedSalary / 1000) * 1000));
  }

  return {
    name,
    email: emailMatch?.[0] || undefined,
    phone: phoneMatch?.[0] || undefined,
    education: [],
    experience: [],
    skills,
    rawResumeText: rawText,
    targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
    targetIndustry: targetIndustry || undefined,
    expectedSalary: expectedSalary || undefined,
  };
}
