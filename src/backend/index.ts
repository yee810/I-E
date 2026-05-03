import express, { Request, Response } from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ENV } from "./config/env.ts";
import { initSchema } from "./db/init.ts";
import { errorHandler } from "./middleware/errorHandler.ts";

import authRoutes from "./routes/auth.ts";
import profileRoutes from "./routes/profiles.ts";
import preferenceRoutes from "./routes/preferences.ts";
import jobRoutes from "./routes/jobs.ts";
import matchingRoutes from "./routes/matching.ts";
import feedbackRoutes from "./routes/feedback.ts";
import chatRoutes from "./routes/chat.ts";
import eventRoutes from "./routes/events.ts";

initSchema();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: ENV.FRONTEND_URL }));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, env: ENV.NODE_ENV });
});

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/events", eventRoutes);

// Serve frontend static files from built dist/ (relative to backend dir -> ../frontend/dist)
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

app.use(errorHandler as any);

app.listen(ENV.PORT, () => {
  console.log(`[Server] Jobro backend running on http://localhost:${ENV.PORT}`);
});
