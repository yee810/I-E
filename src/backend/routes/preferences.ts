import { Router } from "express";
import db from "../db/connection.ts";

const router = Router();

router.get("/", (req, res, next) => {
  try {
    const userId = Number(req.query.user_id);
    if (!userId) {
      const err = new Error("Missing user_id") as any;
      err.statusCode = 400;
      throw err;
    }
    const row = db.prepare("SELECT * FROM preferences WHERE user_id = ?").get(userId) as any;
    if (!row) {
      res.json({ preference: null });
      return;
    }
    res.json({ preference: row });
  } catch (e) {
    next(e);
  }
});

router.post("/", (req, res, next) => {
  try {
    const { user_id, target_roles, target_industries, target_locations, availability_days, availability_months, salary_min, salary_max, company_size, other_notes } = req.body;
    if (!user_id) {
      const err = new Error("Missing user_id") as any;
      err.statusCode = 400;
      throw err;
    }
    const insert = db.prepare(`
      INSERT INTO preferences (user_id, target_roles, target_industries, target_locations, availability_days, availability_months, salary_min, salary_max, company_size, other_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        target_roles = excluded.target_roles,
        target_industries = excluded.target_industries,
        target_locations = excluded.target_locations,
        availability_days = excluded.availability_days,
        availability_months = excluded.availability_months,
        salary_min = excluded.salary_min,
        salary_max = excluded.salary_max,
        company_size = excluded.company_size,
        other_notes = excluded.other_notes,
        updated_at = CURRENT_TIMESTAMP
    `);
    insert.run(
      user_id,
      target_roles ?? null,
      target_industries ?? null,
      target_locations ?? null,
      availability_days ?? null,
      availability_months ?? null,
      salary_min ?? null,
      salary_max ?? null,
      company_size ?? null,
      other_notes ?? null
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
