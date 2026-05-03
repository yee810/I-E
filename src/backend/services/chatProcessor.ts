/**
 * Extract preference updates from chat messages.
 * MVP: simple keyword heuristics. Future: LLM extraction.
 */
export function extractPreferenceUpdates(message: string): Record<string, any> {
  const text = message.toLowerCase();
  const updates: Record<string, any> = {};

  if (text.includes("不看") || text.includes("不感兴趣") || text.includes("exclude")) {
    const match = text.match(/不看\s*(.+)/);
    if (match) {
      updates.excluded_roles = (match[1] || "").split(/[,，]/).map(s => s.trim()).filter(Boolean);
    }
  }

  if (text.includes("想看") || text.includes("prefer")) {
    const match = text.match(/想看\s*(.+)/);
    if (match) {
      updates.target_roles = (match[1] || "").split(/[,，]/).map(s => s.trim()).filter(Boolean);
    }
  }

  if (text.includes("薪资") || text.includes("salary")) {
    const nums = text.match(/\d{1,6}/g)
      ?.map(Number)
      .filter(n => n > 1000 && n < 1000000) ?? [];
    if (nums.length >= 2) {
      updates.salary_min = Math.min(...nums);
      updates.salary_max = Math.max(...nums);
    }
  }

  return Object.keys(updates).length > 0 ? updates : undefined as any;
}
