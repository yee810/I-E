import { Router } from "express";
import db from "../db/connection.ts";

const router = Router();

router.post("/", (req, res, next) => {
  try {
    const { match_id, type, comment } = req.body;
    if (!match_id || !type) {
      const err = new Error("Missing match_id or type") as any;
      err.statusCode = 400;
      throw err;
    }
    const update = db.prepare("UPDATE matches SET status = ? WHERE id = ?");
    update.run(type, match_id);
    res.json({ ok: true, match_id, status: type, comment: comment ?? null });
  } catch (e) {
    next(e);
  }
});

export default router;
