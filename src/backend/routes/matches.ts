import { Router } from "express";
import db from "../db/connection.ts";
import { AppError } from "../utils/AppError.ts";

const router = Router();

router.get("/me", (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const status = req.query.status as string | undefined;

    let conditions = "m.user_id = ?";
    const params: any[] = [userId];

    if (status) {
      conditions += " AND m.status = ?";
      params.push(status);
    }

    const rows = db.prepare(
      `SELECT
         m.id AS match_id,
         m.match_score,
         m.match_reason,
         m.status,
         m.created_at,
         j.*
       FROM matches m
       JOIN jobs j ON m.job_id = j.id
       WHERE ${conditions}
       ORDER BY m.match_score DESC, m.created_at DESC`
    ).all(...params) as any[];

    res.json({ matches: rows });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", (req, res, next) => {
  try {
    const matchId = Number(req.params.id);
    const { status } = req.body;
    const valid = ["pending", "accepted", "rejected", "expired"];
    if (!valid.includes(status)) {
      throw new AppError("match.invalid_status", 400);
    }

    db.prepare("UPDATE matches SET status = ? WHERE id = ?").run(status, matchId);
    res.json({ ok: true, match_id: matchId, status });
  } catch (e) {
    next(e);
  }
});

export default router;
