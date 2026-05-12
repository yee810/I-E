import { Router } from "express";
import db from "../db/connection.ts";
import { AppError } from "../utils/AppError.ts";

const router = Router();

router.post("/", (req, res, next) => {
  try {
    const { match_id, type, comment } = req.body;
    if (!match_id || !type) {
      throw new AppError("feedback.missing_fields", 400);
    }
    const validTypes = ["pending", "accepted", "rejected", "expired"];
    if (!validTypes.includes(type)) {
      throw new AppError("feedback.invalid_type", 400);
    }
    const update = db.prepare("UPDATE matches SET status = ? WHERE id = ?");
    update.run(type, match_id);
    res.json({ ok: true, match_id, status: type, comment: comment ?? null });
  } catch (e) {
    next(e);
  }
});

export default router;
