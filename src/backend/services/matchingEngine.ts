import db from "../db/connection.ts";
import { GoogleGenAI } from "@google/genai";
import { ENV } from "../config/env.ts";

const ai = ENV.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY }) : null;

export interface MatchResult {
  jobId: number;
  score: number;
  reason: string;
}

/**
 * Run matching for a single user.
 * Phase 1: rule filter, Phase 2: simple keyword overlap recall, Phase 3: LLM rerank + rationale.
 */
export async function runMatching(userId: number, options?: { limit?: number; force?: boolean }): Promise<MatchResult[]> {
  const limit = options?.limit ?? 10;

  const profileRow = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(userId) as any;
  const prefRow = db.prepare("SELECT * FROM preferences WHERE user_id = ?").get(userId) as any;

  if (!profileRow && !prefRow) {
    return [];
  }

  const allJobs = db.prepare("SELECT * FROM jobs WHERE status = 'active'").all() as any[];

  // 1. Hard rule filter
  const today = new Date().toISOString().split("T")[0];
  const filtered = allJobs.filter(j => {
    if (j.deadline && j.deadline < today) return false;
    return true;
  });

  // 2. Simple keyword overlap for MVP (no embedding yet)
  const userText = [
    prefRow?.target_roles ?? "",
    prefRow?.target_industries ?? "",
    prefRow?.target_locations ?? "",
    profileRow?.skills ?? "",
    profileRow?.raw_resume_text ?? "",
  ].join(" ").toLowerCase();

  const scored = filtered.map(job => {
    const jobText = `${job.title} ${job.company} ${job.location} ${job.industry} ${job.role_type} ${job.description ?? ""}`.toLowerCase();
    const overlap = intersectCount(userText.split(/\s+/), jobText.split(/\s+/));
    return { job, overlap };
  }).sort((a, b) => b.overlap - a.overlap).slice(0, Math.min(limit * 3, filtered.length));

  // 3. LLM rerank + rationale (top limit * 3 -> limit)
  if (ai && scored.length > 0) {
    const candidateDescriptions = scored.map(s => `Job ID ${s.job.id}: ${s.job.title} at ${s.job.company} in ${s.job.location}. ${s.job.description ?? ""}`).join("\n");
    const prompt = `You are a career matching engine. Given a candidate profile and a list of job descriptions, rerank the jobs by fit and provide a one-sentence rationale for each.
Candidate profile: ${userText}
Jobs:
${candidateDescriptions}

Return ONLY a JSON array like:
[{"jobId": number, "score": number 0-1, "reason": "string"}]
Top ${limit} jobs only.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-thinking-exp",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = response.text || "";
      const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean) as MatchResult[];
      const valid = parsed.filter(p => typeof p.jobId === "number" && typeof p.score === "number" && typeof p.reason === "string");

      // Persist matches
      const insert = db.prepare("INSERT OR REPLACE INTO matches (user_id, job_id, match_score, match_reason, status) VALUES (?, ?, ?, ?, 'pending')");
      for (const m of valid) {
        insert.run(userId, m.jobId, m.score, m.reason);
      }
      return valid.slice(0, limit);
    } catch {
      // Fallback: straight overlap-based results
    }
  }

  // Fallback / no AI
  const fallback = scored.slice(0, limit).map(s => ({
    jobId: s.job.id,
    score: Math.min(0.95, 0.3 + s.overlap * 0.05),
    reason: `Keyword overlap score: ${s.overlap}`,
  }));

  const insert = db.prepare("INSERT OR REPLACE INTO matches (user_id, job_id, match_score, match_reason, status) VALUES (?, ?, ?, ?, 'pending')");
  for (const m of fallback) {
    insert.run(userId, m.jobId, m.score, m.reason);
  }
  return fallback;
}

function intersectCount(a: string[], b: string[]) {
  const setB = new Set(b);
  let count = 0;
  for (const w of a) {
    if (w.length > 2 && setB.has(w)) count++;
  }
  return count;
}
