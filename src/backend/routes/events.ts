import { Router } from "express";
import db from "../db/connection.ts";
import { AppError } from "../utils/AppError.ts";

const router = Router();

router.post("/", (req, res, next) => {
  try {
    const { event_type, payload } = req.body;
    const userId = (req as any).user?.id;
    if (!event_type) {
      throw new AppError("events.missing_type", 400);
    }
    const insert = db.prepare("INSERT INTO events (event_type, user_id, payload) VALUES (?, ?, ?)");
    insert.run(event_type, userId ?? null, payload ? JSON.stringify(payload) : null);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
