import { Router } from "express";
import db from "../db/connection.ts";

const router = Router();

router.post("/", (req, res, next) => {
  try {
    const { event_type, user_id, payload } = req.body;
    if (!event_type) {
      const err = new Error("Missing event_type") as any;
      err.statusCode = 400;
      throw err;
    }
    const insert = db.prepare("INSERT INTO events (event_type, user_id, payload) VALUES (?, ?, ?)");
    insert.run(event_type, user_id ?? null, payload ? JSON.stringify(payload) : null);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
