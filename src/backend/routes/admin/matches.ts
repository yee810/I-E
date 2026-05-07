import { Router } from "express";
import * as svc from "../../services/adminMatchService.ts";
import { AppError } from "../../utils/AppError.ts";
import { logAction } from "../../services/adminSystemService.ts";

const router = Router();

router.get("/matches", (req, res, next) => {
  try {
    const result = svc.listMatches({
      page: Number(req.query.page) || undefined,
      limit: Number(req.query.limit) || undefined,
      sort: req.query.sort as string || undefined,
      order: req.query.order as any || undefined,
      status: req.query.status as string || undefined,
      userId: req.query.user_id ? Number(req.query.user_id) : undefined,
      jobId: req.query.job_id ? Number(req.query.job_id) : undefined,
      minScore: req.query.min_score ? Number(req.query.min_score) : undefined,
    });
    res.json(result);
  } catch (e) { next(e); }
});

router.patch("/matches/:id/status", (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "accepted", "rejected", "expired"];
    if (!valid.includes(status)) throw new AppError("match.invalid_status", 400);

    const match = svc.updateMatchStatus(Number(req.params.id), status);
    if (!match) throw new AppError("match.not_found", 404);

    logAction((req as any).user.id, "match.status_update", "match", Number(req.params.id), { status });
    res.json({ match });
  } catch (e) { next(e); }
});

router.delete("/matches/:id", (req, res, next) => {
  try {
    const existing = svc.getMatch(Number(req.params.id));
    if (!existing) throw new AppError("match.not_found", 404);

    svc.deleteMatch(Number(req.params.id));
    logAction((req as any).user.id, "match.delete", "match", Number(req.params.id));
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post("/matches/bulk-status", (req, res, next) => {
  try {
    const { match_ids, status } = req.body;
    if (!match_ids?.length || !status) throw new AppError("match.ids_required", 400);

    const valid = ["pending", "accepted", "rejected", "expired"];
    if (!valid.includes(status)) throw new AppError("match.invalid_status", 400);

    const count = svc.bulkUpdateMatchStatus(match_ids, status);
    logAction((req as any).user.id, "match.bulk_status_update", "match", undefined, { count, status });
    res.json({ updated: count });
  } catch (e) { next(e); }
});

export default router;
