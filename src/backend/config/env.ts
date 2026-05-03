import dotenv from "dotenv";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

export const ENV = {
  PORT: Number(process.env.PORT ?? 3001),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-in-prod",
  DB_PATH: process.env.DB_PATH ?? join(__dirname, "../jobro.db"),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
};

if (!ENV.GEMINI_API_KEY && ENV.NODE_ENV !== "test") {
  console.warn("[WARN] GEMINI_API_KEY is not set. AI features will be disabled.");
}
