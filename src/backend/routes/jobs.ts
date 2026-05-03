import { Router } from "express";
import db from "../db/connection.ts";

const router = Router();

router.get("/", (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const offset = Number(req.query.offset ?? 0);
    const rows = db.prepare("SELECT * FROM jobs WHERE status = 'active' ORDER BY created_at DESC LIMIT ? OFFSET ?").all(limit, offset) as any[];
    res.json({ jobs: rows.map(r => ({ ...r, tags: r.tags ? JSON.parse(r.tags) : [] })) });
  } catch (e) {
    next(e);
  }
});

router.post("/bulk", (req, res, next) => {
  try {
    const { jobs } = req.body;
    if (!Array.isArray(jobs) || jobs.length === 0) {
      const err = new Error("jobs must be a non-empty array") as any;
      err.statusCode = 400;
      throw err;
    }
    const insert = db.prepare(`
      INSERT INTO jobs (source, source_url, title, company, location, description, requirements, responsibilities, salary_min, salary_max, salary_currency, deadline, job_type, industry, role_type, seniority, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((items: any[]) => {
      for (const j of items) {
        insert.run(
          j.source ?? "manual",
          j.source_url ?? null,
          j.title,
          j.company,
          j.location ?? null,
          j.description ?? null,
          j.requirements ?? null,
          j.responsibilities ?? null,
          j.salary_min ?? null,
          j.salary_max ?? null,
          j.salary_currency ?? "HKD",
          j.deadline ?? null,
          j.job_type ?? null,
          j.industry ?? null,
          j.role_type ?? null,
          j.seniority ?? null,
          j.tags ? JSON.stringify(j.tags) : null
        );
      }
    });
    insertMany(jobs);
    res.json({ ok: true, inserted: jobs.length });
  } catch (e) {
    next(e);
  }
});

export default router;
