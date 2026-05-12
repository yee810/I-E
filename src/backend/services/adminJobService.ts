import db from "../db/connection.ts";
import { parsePagination, PaginationOptions } from "../utils/pagination.ts";

const JOB_SORT_COLUMNS = ["id", "title", "company", "status", "created_at"];

export function listJobs(
  options: PaginationOptions & {
    status?: string;
    search?: string;
    company?: string;
    industry?: string;
  }
) {
  const { page, limit, offset, order, sort } = parsePagination({
    ...options,
    allowedSortColumns: JOB_SORT_COLUMNS,
  });

  const conditions: string[] = [];
  const params: any[] = [];

  if (options.status) {
    conditions.push("status = ?");
    params.push(options.status);
  }
  if (options.search) {
    conditions.push("(title LIKE ? OR description LIKE ?)");
    params.push(`%${options.search}%`, `%${options.search}%`);
  }
  if (options.company) {
    conditions.push("company LIKE ?");
    params.push(`%${options.company}%`);
  }
  if (options.industry) {
    conditions.push("industry = ?");
    params.push(options.industry);
  }

  const where = conditions.length > 0 ? conditions.join(" AND ") : "1=1";

  const countRow = db
    .prepare(`SELECT COUNT(*) as total FROM jobs WHERE ${where}`)
    .get(...params) as any;

  const jobs = db
    .prepare(
      `SELECT * FROM jobs WHERE ${where} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as any[];

  for (const job of jobs) {
    try { job.tags = JSON.parse(job.tags); } catch {}
  }

  return {
    data: jobs,
    total: countRow.total,
    page,
    totalPages: Math.ceil(countRow.total / limit),
  };
}

export function getJob(id: number) {
  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as any;
  if (job) {
    try { job.tags = JSON.parse(job.tags); } catch {}
  }
  return job;
}

export function createJob(data: any) {
  const tags = typeof data.tags === "object" ? JSON.stringify(data.tags) : data.tags;
  const info = db
    .prepare(
      `INSERT INTO jobs (source, source_url, title, company, location, description, requirements, responsibilities, salary_min, salary_max, salary_currency, deadline, job_type, industry, role_type, seniority, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.source || "manual",
      data.source_url,
      data.title,
      data.company,
      data.location,
      data.description,
      data.requirements,
      data.responsibilities,
      data.salary_min,
      data.salary_max,
      data.salary_currency || "CNY",
      data.deadline,
      data.job_type,
      data.industry,
      data.role_type,
      data.seniority,
      tags,
      data.status || "active"
    );
  return getJob(Number(info.lastInsertRowid));
}

export function updateJob(id: number, data: any) {
  const sets: string[] = [];
  const params: any[] = [];

  const fields = [
    "source", "source_url", "title", "company", "location", "description",
    "requirements", "responsibilities", "salary_min", "salary_max",
    "salary_currency", "deadline", "job_type", "industry", "role_type",
    "seniority", "status",
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      sets.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (data.tags !== undefined) {
    sets.push("tags = ?");
    params.push(typeof data.tags === "object" ? JSON.stringify(data.tags) : data.tags);
  }

  if (sets.length === 0) return getJob(id);

  params.push(id);
  db.prepare(`UPDATE jobs SET ${sets.join(", ")} WHERE id = ?`).run(...params);
  return getJob(id);
}

export function deleteJob(id: number) {
  db.prepare("DELETE FROM matches WHERE job_id = ?").run(id);
  db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
}

export function updateJobStatus(id: number, status: string) {
  db.prepare("UPDATE jobs SET status = ? WHERE id = ?").run(status, id);
  return getJob(id);
}
