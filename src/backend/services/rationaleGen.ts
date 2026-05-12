import { openai } from "./openaiClient.ts";
import { ENV } from "../config/env.ts";

/**
 * Generate a human-readable rationale for a single job match.
 */
export async function generateRationale(
  userText: string,
  job: any
): Promise<string> {
  if (!openai) {
    return `Based on your profile, ${job.title} at ${job.company} could be a good fit.`;
  }
  const prompt = `Explain in one friendly sentence why this job is a good match for the candidate.
Candidate: ${userText}
Job: ${job.title} at ${job.company}. ${job.description ?? ""}`;

  try {
    const response = await openai.chat.completions.create({
      model: ENV.OPENAI_MATCHING_MODEL,
      messages: [{ role: "user", content: prompt }],
    });
    return (response.choices[0]?.message?.content || "").trim() || "A strong match based on your skills and preferences.";
  } catch {
    return `Based on your profile, ${job.title} at ${job.company} looks like a strong match.`;
  }
}
