import dotenv from "dotenv";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "../../../");
dotenv.config({ path: join(ROOT_DIR, ".env") });

function resolvePath(p: string) {
  if (!p) return p;
  return p.startsWith("/") ? p : join(ROOT_DIR, p);
}

export const ENV = {
  PORT: Number(process.env.PORT ?? 3001),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL ?? "",
  OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-in-prod",
  DB_PATH: resolvePath(process.env.DB_PATH ?? "./src/backend/jobro.db"),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@jobro.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "admin123",
};

if (!ENV.OPENAI_API_KEY && ENV.NODE_ENV !== "test") {
  console.warn("[WARN] OPENAI_API_KEY is not set. AI features will be disabled.");
}
