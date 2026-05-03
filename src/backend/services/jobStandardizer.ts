export interface StandardizedJob {
  title: string;
  company: string;
  location?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  deadline?: string;
  job_type?: string;
  industry?: string;
  role_type?: string;
  seniority?: string;
  tags?: string[];
  source: "manual" | "scrape" | "excel";
  source_url?: string;
}

export function standardize(raw: any): StandardizedJob {
  const dedupedTags = [...new Set<string>((raw.tags ?? []).map((t: string) => t.toLowerCase().trim()))];
  return {
    title: norm(raw.title),
    company: norm(raw.company),
    location: raw.location ? norm(raw.location) : undefined,
    description: raw.description ? String(raw.description).trim() : undefined,
    requirements: raw.requirements ? String(raw.requirements).trim() : undefined,
    responsibilities: raw.responsibilities ? String(raw.responsibilities).trim() : undefined,
    salary_min: toNum(raw.salary_min),
    salary_max: toNum(raw.salary_max),
    salary_currency: norm(raw.salary_currency) || "HKD",
    deadline: raw.deadline || undefined,
    job_type: norm(raw.job_type),
    industry: norm(raw.industry),
    role_type: norm(raw.role_type),
    seniority: norm(raw.seniority),
    tags: dedupedTags.length > 0 ? dedupedTags : undefined,
    source: raw.source ?? "manual",
    source_url: raw.source_url,
  };
}

function norm(v: unknown): string {
  if (typeof v === "string") return v.trim();
  return "";
}

function toNum(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
