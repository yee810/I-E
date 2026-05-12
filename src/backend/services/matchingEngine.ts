import db from "../db/connection.ts";
import { openai } from "./openaiClient.ts";
import { ENV } from "../config/env.ts";

export interface MatchResult {
  jobId: number;
  score: number;
  reason: string;
}

export type AgentStep =
  | { type: "filter"; label: string; detail: string }
  | { type: "scan"; label: string; detail: string }
  | { type: "tool_call"; label: string; detail: string }
  | { type: "tool_result"; label: string; detail: string }
  | { type: "scoring"; label: string; detail: string }
  | { type: "done"; label: string; detail: string };

function parseJsonField(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [String(value)];
  } catch {
    return value.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
  }
}

function tokenize(text: string): string[] {
  if (!text) return [];
  const tokens = new Set<string>();
  const parts = text.split(/[\s,，、；;|·\n\r]+/).filter(Boolean);
  for (const part of parts) {
    if (/[一-鿿]/.test(part)) {
      tokens.add(part);
      for (let i = 0; i < part.length - 1; i++) {
        const bigram = part.substring(i, i + 2);
        if (/^[一-鿿]{2}$/.test(bigram)) tokens.add(bigram);
      }
    } else if (part.length > 1) {
      tokens.add(part.toLowerCase());
    }
  }
  return Array.from(tokens);
}

function intersectCount(a: string[], b: string[]) {
  const setB = new Set(b);
  let count = 0;
  for (const w of a) { if (setB.has(w)) count++; }
  return count;
}

function buildJobText(job: any): string {
  return [job.title, job.company, job.location, job.industry, job.role_type, job.description, job.requirements, job.responsibilities, job.tags ?? "", job.job_type].filter(Boolean).join(" ").toLowerCase();
}

function computeStructuralBonus(profileRow: any, prefRow: any, job: any): number {
  let bonus = 0;
  const targetRoles = parseJsonField(prefRow?.target_roles);
  if (targetRoles.length > 0) {
    const jt = (job.title || "").toLowerCase(), rt = (job.role_type || "").toLowerCase();
    for (const r of targetRoles) { const rl = r.toLowerCase(); if (jt.includes(rl) || rl.includes(jt) || rt.includes(rl) || rl.includes(rt)) { bonus += 0.35; break; } }
  }
  const targetIndustries = parseJsonField(prefRow?.target_industries);
  if (targetIndustries.length > 0 && job.industry) {
    const ji = job.industry.toLowerCase();
    for (const ind of targetIndustries) { const il = ind.toLowerCase(); if (ji.includes(il) || il.includes(ji)) { bonus += 0.25; break; } }
  }
  const skills: string[] = parseJsonField(profileRow?.skills);
  if (skills.length > 0) {
    const jt = buildJobText(job);
    const mc = skills.filter(s => jt.includes(s.toLowerCase())).length;
    if (mc > 0) bonus += 0.3 * Math.min(mc / Math.max(skills.length, 1), 1);
  }
  const targetLocations = parseJsonField(prefRow?.target_locations);
  if (targetLocations.length > 0 && job.location) {
    const jl = job.location.toLowerCase();
    for (const loc of targetLocations) { if (jl.includes(loc.toLowerCase())) { bonus += 0.05; break; } }
  }
  return bonus;
}

function generateFallbackReason(profileRow: any, prefRow: any, job: any): string {
  const reasons: string[] = [];
  const jt = (job.title || "").toLowerCase(), jd = buildJobText(job), ji = (job.industry || "").toLowerCase(), jl = (job.location || "").toLowerCase();
  const targetRoles = parseJsonField(prefRow?.target_roles);
  if (targetRoles.length > 0) { const m = targetRoles.filter(r => { const rl = r.toLowerCase(); return jt.includes(rl) || rl.includes(jt) || (job.role_type && job.role_type.toLowerCase().includes(rl)); }); if (m.length > 0) reasons.push(`目标职位「${m[0]}」与该岗位匹配`); }
  const targetIndustries = parseJsonField(prefRow?.target_industries);
  if (targetIndustries.length > 0 && job.industry) { const m = targetIndustries.filter(i => { const il = i.toLowerCase(); return ji.includes(il) || il.includes(ji); }); if (m.length > 0) reasons.push(`目标行业「${m[0]}」与该岗位行业一致`); }
  const skills: string[] = parseJsonField(profileRow?.skills);
  if (skills.length > 0) { const m = skills.filter(s => { const sl = s.toLowerCase(); return jd.includes(sl) || jt.includes(sl); }); if (m.length > 0) reasons.push(`你的技能「${m.slice(0, 3).join("、")}」与岗位要求相符`); }
  const targetLocations = parseJsonField(prefRow?.target_locations);
  if (targetLocations.length > 0 && job.location) { const m = targetLocations.filter(l => jl.includes(l.toLowerCase())); if (m.length > 0) reasons.push(`工作地点「${job.location}」符合你的偏好`); }
  let edu: any[] = [];
  try { edu = profileRow?.education ? JSON.parse(profileRow.education) : []; } catch {}
  if (edu.length > 0) { const d = edu[0]?.degree, f = edu[0]?.field; if (d) reasons.push(`你的学历背景「${f ? `${d}（${f}）` : d}」满足岗位基础要求`); }
  return reasons.length > 0 ? reasons.join("；") : `${job.title || "该岗位"}与你的背景和求职方向有一定相关性`;
}

const AGENT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_job_detail",
      description: "获取指定岗位的完整详情，包括职责描述、任职要求等。当你需要深入了解某个岗位是否匹配候选人时调用此工具。",
      parameters: { type: "object", properties: { job_id: { type: "number", description: "岗位ID" } }, required: ["job_id"] },
    },
  },
];

const INDUSTRY_ZH: Record<string, string> = { technology: "科技", fintech: "金融科技", banking: "银行", consulting: "咨询", healthcare: "医疗" };

async function runAgentMatching(
  profileRow: any, prefRow: any, scored: Array<{ job: any; overlap: number; structuralBonus: number }>, limit: number, userId: number, onStep?: (step: AgentStep) => void,
): Promise<MatchResult[]> {
  const skills: string[] = parseJsonField(profileRow?.skills);
  const targetRoles: string[] = parseJsonField(prefRow?.target_roles);
  const targetIndustries: string[] = parseJsonField(prefRow?.target_industries);
  const targetLocations: string[] = parseJsonField(prefRow?.target_locations);
  const excludedRoles: string[] = parseJsonField(prefRow?.excluded_roles);
  const excludedLocations: string[] = parseJsonField(prefRow?.excluded_locations);
  const excludedLine = excludedRoles.length > 0 ? `\n候选人排除的职位类型：${excludedRoles.join("、")}` : "";
  const locationLine = targetLocations.length > 0 ? `\n目标工作地点：${targetLocations.join("、")}（必须优先推荐这些城市的岗位，不要推荐其他城市的岗位）` : "";
  const excludedLocationLine = excludedLocations.length > 0 ? `\n排除的工作地点：${excludedLocations.join("、")}（绝对不要推荐这些城市的岗位）` : "";
  const profileSummary = [
    targetRoles.length > 0 ? `目标职位：${targetRoles.join("、")}` : "",
    targetIndustries.length > 0 ? `目标行业：${targetIndustries.join("、")}` : "",
    targetLocations.length > 0 ? `目标工作地点：${targetLocations.join("、")}` : "",
    skills.length > 0 ? `核心技能：${skills.join("、")}` : "",
    profileRow?.raw_resume_text ? `简历摘要：${profileRow.raw_resume_text.slice(0, 500)}` : "",
  ].filter(Boolean).join("\n");
  const jobSummaries = scored.slice(0, 15).map(s => `[ID:${s.job.id}] ${s.job.title} @ ${s.job.company} | ${s.job.location} | ${s.job.industry} | ${s.job.role_type} | ${s.job.salary_min ?? "?"}-${s.job.salary_max ?? "?"}CNY`).join("\n");
  const systemPrompt = `你是一个职业匹配Agent。根据候选人资料，从候选岗位中找出最匹配的岗位。

你可以调用 get_job_detail 工具查看任何岗位的完整详情（职责、要求等），以便做出精确匹配判断。

工作流程：
1. 审阅候选人资料和候选岗位摘要
2. 对感兴趣的岗位调用 get_job_detail 查看详情
3. 综合分析后给出最终匹配结果

候选人资料：
${profileSummary}${excludedLine}${locationLine}${excludedLocationLine}

候选岗位（已通过硬性条件筛选，全部符合地点/行业要求）：
${jobSummaries}

【重要规则】
1. 最终回复必须是一个纯JSON数组，不要包含任何其他文字
2. 推荐数量由你决定：只推荐真正匹配的岗位，可以是3个、5个、7个，不要凑数
3. 如果某个岗位明显不适合候选人，不要推荐
4. score 必须真实反映匹配程度，不要虚高

正确示例：
[{"jobId":1,"score":0.85,"reason":"技能匹配"},{"jobId":2,"score":0.7,"reason":"行业匹配"}]`;
  const messages: any[] = [{ role: "system", content: systemPrompt }, { role: "user", content: "请根据我的背景，查看你需要的岗位详情，然后给出最终匹配结果。" }];
  const MAX_ROUNDS = 8;
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const resp = await openai!.chat.completions.create({ model: ENV.OPENAI_MATCHING_MODEL, messages, tools: AGENT_TOOLS, tool_choice: "auto" });
    const msg = resp.choices[0].message;
    const normalizedMsg = { ...msg, content: msg.content ?? "" };
    messages.push(normalizedMsg);

    // If model produced text but no tool calls, check if it's a proper JSON result
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      const content = normalizedMsg.content.trim();
      const jsonAttempt = content.replace(/<think[\s>][\s\S]*?<\/think>/g, "").replace(/<think[\s>][\s\S]*$/g, "").replace(/^\s*<\/think>\s*/gm, "").replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonMatch = jsonAttempt.match(/\[[\s\S]*\]/);

      // Got valid JSON — break out of loop
      if (jsonMatch) break;

      // Model output prose without JSON — nudge it to output JSON only
      if (content.length > 0) {
        messages.push({ role: "user", content: "请直接输出JSON数组结果，不要包含任何其他文字。" });
        continue;
      }
      break;
    }

    // Process tool calls — only allow querying jobs from the candidate list
    const candidateJobIds = new Set(scored.map(s => s.job.id));
    for (const tc of msg.tool_calls) {
      if (tc.function.name === "get_job_detail") {
        let jobId: number | null = null;
        try {
          const parsed = JSON.parse(tc.function.arguments);
          jobId = Number(parsed.job_id);
          if (isNaN(jobId)) jobId = null;
        } catch {}
        if (jobId !== null && candidateJobIds.has(jobId)) {
          const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(jobId) as any;
          onStep?.({ type: "tool_call", label: "查看岗位详情", detail: job ? `${job.title} @ ${job.company}` : `ID:${jobId}` });
          console.log(`[Agent] Round ${round}: get_job_detail(${jobId})`);
          messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(job || { error: "未找到该岗位" }) });
          onStep?.({ type: "tool_result", label: "获取岗位信息", detail: job ? `已获取「${job.title}」的要求与职责` : "未找到该岗位" });
        } else {
          messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify({ error: jobId ? "该岗位不在候选列表中" : "无效的岗位ID" }) });
        }
      }
    }
  }
  // Find the last assistant message with actual content
  let finalText = "";
  for (let i = messages.length - 1; i >= 0; i--) { const m = messages[i]; if (m.role === "assistant" && m.content && typeof m.content === "string") { finalText = m.content; break; } }
  if (!finalText) throw new Error("Agent returned no text content");
  onStep?.({ type: "scoring", label: "计算匹配度", detail: "AI 综合分析中..." });
  const clean = finalText.replace(/<think[\s>][\s\S]*?<\/think>/g, "").replace(/<think[\s>][\s\S]*$/g, "").replace(/^\s*<\/think>\s*/gm, "").replace(/```json/g, "").replace(/```/g, "").trim();
  const jsonMatch = clean.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("[Agent] Raw output (first 500 chars):", finalText.slice(0, 500));
    throw new Error(`Agent output is not valid JSON: ${clean.slice(0, 200)}`);
  }
  const parsed = JSON.parse(jsonMatch[0]) as MatchResult[];
  // Only accept jobIds that are in the candidate list (prevents hallucinated/filtered-out IDs)
  const candidateJobIds = new Set(scored.map(s => s.job.id));
  const valid = parsed.filter(p => typeof p.jobId === "number" && typeof p.score === "number" && typeof p.reason === "string" && candidateJobIds.has(p.jobId));
  const insert = db.prepare("INSERT OR REPLACE INTO matches (user_id, job_id, match_score, match_reason, status) VALUES (?, ?, ?, ?, 'pending')");
  for (const m of valid) insert.run(userId, m.jobId, m.score, m.reason);
  onStep?.({ type: "done", label: "匹配完成", detail: `找到 ${valid.length} 个推荐岗位` });
  console.log(`[Agent] Final: ${valid.length} matches for user ${userId}`);
  return valid.slice(0, limit);
}

export async function runMatching(userId: number, options?: { limit?: number; force?: boolean; onStep?: (step: AgentStep) => void }): Promise<MatchResult[]> {
  const limit = options?.limit ?? 10;
  const onStep = options?.onStep;
  const profileRow = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(userId) as any;
  const prefRow = db.prepare("SELECT * FROM preferences WHERE user_id = ?").get(userId) as any;
  if (!profileRow && !prefRow) return [];

  // If not forced and matches already exist, return them directly
  if (!options?.force) {
    const existing = db.prepare("SELECT job_id as jobId, match_score as score, match_reason as reason FROM matches WHERE user_id = ? AND status = 'pending' ORDER BY match_score DESC LIMIT ?").all(userId, limit) as MatchResult[];
    if (existing.length > 0) {
      onStep?.({ type: "done", label: "匹配完成", detail: `已有 ${existing.length} 个推荐岗位` });
      return existing;
    }
  }

  // When forced, clear old pending matches first so stale results don't linger
  if (options?.force) {
    db.prepare("DELETE FROM matches WHERE user_id = ? AND status = 'pending'").run(userId);
  }

  // === Hard filters: industry, location, excluded locations ===
  const targetIndustries = parseJsonField(prefRow?.target_industries);
  const targetLocations = parseJsonField(prefRow?.target_locations);
  const excludedLocations = parseJsonField(prefRow?.excluded_locations);

  let jobQuery = "SELECT * FROM jobs WHERE status = 'active'";
  const qParams: any[] = [];
  if (targetIndustries.length > 0) {
    const ph = targetIndustries.map(() => "?").join(",");
    jobQuery += ` AND industry IN (${ph})`;
    qParams.push(...targetIndustries);
  }
  const today = new Date().toISOString().split("T")[0];
  let allJobs = (db.prepare(jobQuery).all(...qParams) as any[]).filter(j => !j.deadline || j.deadline >= today);

  // Hard filter: excluded locations — completely remove
  if (excludedLocations.length > 0) {
    allJobs = allJobs.filter(j => !excludedLocations.some(loc => (j.location || "").includes(loc)));
  }
  // Hard filter: target locations — ONLY keep matching cities (no scoring, no penalty)
  if (targetLocations.length > 0) {
    allJobs = allJobs.filter(j => targetLocations.some(loc => (j.location || "").includes(loc)));
  }

  if (allJobs.length === 0) return [];

  onStep?.({ type: "filter", label: "筛选", detail: [
    targetIndustries.length > 0 ? `行业：${targetIndustries.map(i => INDUSTRY_ZH[i] || i).join("、")}` : "",
    targetLocations.length > 0 ? `地点：${targetLocations.join("、")}` : "",
    excludedLocations.length > 0 ? `排除：${excludedLocations.join("、")}` : "",
    `${allJobs.length} 个岗位`,
  ].filter(Boolean).join(" → ") });

  // === Light scoring: just for ordering candidates to send to AI ===
  const excludedRoles: string[] = parseJsonField(prefRow?.excluded_roles);
  const skills: string[] = parseJsonField(profileRow?.skills);
  const targetRoles: string[] = parseJsonField(prefRow?.target_roles);
  const userText = [...targetRoles, ...targetIndustries, ...skills, profileRow?.raw_resume_text ?? ""].join(" ").toLowerCase();
  const userTokens = tokenize(userText);

  const scored = allJobs.map(job => {
    const jobFullText = buildJobText(job);
    let overlap = intersectCount(userTokens, tokenize(jobFullText));
    const structuralBonus = computeStructuralBonus(profileRow, prefRow, job);
    if (excludedRoles.length > 0) { for (const ex of excludedRoles) { if (jobFullText.includes(ex.toLowerCase())) { overlap -= 5; break; } } }
    return { job, overlap, structuralBonus };
  }).sort((a, b) => (b.overlap + b.structuralBonus * 100) - (a.overlap + a.structuralBonus * 100));

  // Take top candidates to send to AI (more than limit so AI has choices)
  const candidates = scored.slice(0, Math.min(15, scored.length));

  onStep?.({ type: "scan", label: "扫描候选岗位", detail: `${candidates.length} 个岗位进入 AI 分析` });

  if (openai && candidates.length > 0) {
    try { return await runAgentMatching(profileRow, prefRow, candidates, limit, userId, onStep); }
    catch (agentErr) { console.error("[Matching] Agent mode failed, falling back:", agentErr); onStep?.({ type: "scan", label: "使用本地匹配", detail: "AI 暂不可用，使用本地算法" }); }
  }

  // Fallback: return top candidates with simple scores
  const userTokenCount = Math.max(userTokens.length, 1);
  const fallback = candidates.slice(0, limit).map(s => {
    const ratio = Math.max(0, s.overlap) / userTokenCount;
    const score = Math.min(0.95, Math.max(0.1, Math.min(0.95, ratio * 2) + s.structuralBonus));
    return { jobId: s.job.id, score: Math.round(score * 100) / 100, reason: generateFallbackReason(profileRow, prefRow, s.job) };
  });
  onStep?.({ type: "done", label: "匹配完成", detail: `找到 ${fallback.length} 个推荐岗位（本地算法）` });
  const insert = db.prepare("INSERT OR REPLACE INTO matches (user_id, job_id, match_score, match_reason, status) VALUES (?, ?, ?, ?, 'pending')");
  for (const m of fallback) insert.run(userId, m.jobId, m.score, m.reason);
  return fallback;
}
