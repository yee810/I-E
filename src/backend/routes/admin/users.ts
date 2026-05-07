import { Router } from "express";
import * as svc from "../../services/adminUserService.ts";
import { AppError } from "../../utils/AppError.ts";
import { logAction } from "../../services/adminSystemService.ts";

const router = Router();

router.get("/users", (req, res, next) => {
  try {
    const result = svc.listUsers({
      page: Number(req.query.page) || undefined,
      limit: Number(req.query.limit) || undefined,
      sort: req.query.sort as string || undefined,
      order: req.query.order as any || undefined,
      search: req.query.search as string || undefined,
    });
    res.json(result);
  } catch (e) { next(e); }
});

router.get("/users/:id", (req, res, next) => {
  try {
    const user = svc.getUser(Number(req.params.id));
    if (!user) throw new AppError("user.not_found", 404);
    res.json({ user });
  } catch (e) { next(e); }
});

router.put("/users/:id", (req, res, next) => {
  try {
    const user = svc.getUser(Number(req.params.id));
    if (!user) throw new AppError("user.not_found", 404);

    const { role, email } = req.body;
    if (role && !["user", "admin"].includes(role)) {
      throw new AppError("user.invalid_role", 400);
    }

    const updated = svc.updateUser(Number(req.params.id), { role, email });
    logAction((req as any).user.id, "user.update", "user", Number(req.params.id), { role, email });
    res.json({ user: updated });
  } catch (e) { next(e); }
});

router.delete("/users/:id", (req, res, next) => {
  try {
    const user = svc.getUser(Number(req.params.id));
    if (!user) throw new AppError("user.not_found", 404);

    svc.deleteUser(Number(req.params.id));
    logAction((req as any).user.id, "user.delete", "user", Number(req.params.id));
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.get("/users/:id/profile", (req, res, next) => {
  try {
    const profile = svc.getUserProfile(Number(req.params.id));
    if (!profile) throw new AppError("user.not_found", 404);
    res.json({ profile });
  } catch (e) { next(e); }
});

router.get("/users/:id/preferences", (req, res, next) => {
  try {
    const preference = svc.getUserPreferences(Number(req.params.id));
    if (!preference) throw new AppError("user.not_found", 404);
    res.json({ preference });
  } catch (e) { next(e); }
});

router.get("/users/:id/conversations", (req, res, next) => {
  try {
    const result = svc.getUserConversations(Number(req.params.id), {
      page: Number(req.query.page) || undefined,
      limit: Number(req.query.limit) || undefined,
    });
    res.json(result);
  } catch (e) { next(e); }
});

router.get("/users/:id/matches", (req, res, next) => {
  try {
    const result = svc.getUserMatches(Number(req.params.id), {
      page: Number(req.query.page) || undefined,
      limit: Number(req.query.limit) || undefined,
      status: req.query.status as string || undefined,
    });
    res.json(result);
  } catch (e) { next(e); }
});

export default router;
