import { Router } from "express";
import * as svc from "../../services/adminSystemService.ts";
import { AppError } from "../../utils/AppError.ts";

const router = Router();

router.get("/system/health", (_req, res, next) => {
  try {
    res.json(svc.getHealth());
  } catch (e) { next(e); }
});

router.get("/system/config", (_req, res, next) => {
  try {
    res.json({ config: svc.getAllConfig() });
  } catch (e) { next(e); }
});

router.put("/system/config/:key", (req, res, next) => {
  try {
    const { value } = req.body;
    if (value === undefined) throw new AppError("config.not_found", 400);

    const config = svc.updateConfig(req.params.key, value, (req as any).user.id);
    if (!config) throw new AppError("config.not_found", 404);
    res.json({ config });
  } catch (e) { next(e); }
});

router.get("/system/audit-log", (req, res, next) => {
  try {
    const result = svc.getAuditLog({
      page: Number(req.query.page) || undefined,
      limit: Number(req.query.limit) || undefined,
      sort: req.query.sort as string || undefined,
      order: req.query.order as any || undefined,
      adminId: req.query.admin_id ? Number(req.query.admin_id) : undefined,
      action: req.query.action as string || undefined,
    });
    res.json(result);
  } catch (e) { next(e); }
});

export default router;
