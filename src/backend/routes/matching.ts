import { Router } from "express";
import { runMatching } from "../services/matchingEngine.ts";

const router = Router();

router.get("/recommendations", async (req, res, next) => {
  try {
    const userId = Number(req.query.user_id);
    const limit = Number(req.query.limit ?? 10);
    if (!userId) {
      const err = new Error("Missing user_id") as any;
      err.statusCode = 400;
      throw err;
    }
    const results = await runMatching(userId, { limit });
    res.json({ recommendations: results });
  } catch (e) {
    next(e);
  }
});

router.post("/run", async (req, res, next) => {
  try {
    const userId = Number(req.body.user_id);
    const limit = Number(req.body.limit ?? 10);
    if (!userId) {
      const err = new Error("Missing user_id") as any;
      err.statusCode = 400;
      throw err;
    }
    const results = await runMatching(userId, { limit, force: true });
    res.json({ recommendations: results });
  } catch (e) {
    next(e);
  }
});

export default router;
