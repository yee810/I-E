import { Router } from "express";
import { authGuard } from "../../middleware/authGuard.ts";
import { adminGuard } from "../../middleware/adminGuard.ts";
import userRoutes from "./users.ts";
import jobRoutes from "./jobs.ts";
import matchRoutes from "./matches.ts";
import analyticsRoutes from "./analytics.ts";
import conversationRoutes from "./conversations.ts";
import systemRoutes from "./system.ts";

const router = Router();

router.use(authGuard);
router.use(adminGuard);

router.use(userRoutes);
router.use(jobRoutes);
router.use(matchRoutes);
router.use(analyticsRoutes);
router.use(conversationRoutes);
router.use(systemRoutes);

export default router;
