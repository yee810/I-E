import { Router } from "express";
import * as svc from "../../services/adminAnalyticsService.ts";

const router = Router();

router.get("/analytics/overview", (_req, res, next) => {
  try {
    res.json(svc.getOverview());
  } catch (e) { next(e); }
});

router.get("/analytics/users-over-time", (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    res.json(svc.getUsersOverTime(days));
  } catch (e) { next(e); }
});

router.get("/analytics/jobs-by-industry", (_req, res, next) => {
  try {
    res.json(svc.getJobsByIndustry());
  } catch (e) { next(e); }
});

router.get("/analytics/match-stats", (_req, res, next) => {
  try {
    res.json(svc.getMatchStats());
  } catch (e) { next(e); }
});

router.get("/analytics/chat-usage", (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    res.json(svc.getChatUsage(days));
  } catch (e) { next(e); }
});

export default router;
