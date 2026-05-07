import db from "./connection.ts";
import { ENV } from "../config/env.ts";
import crypto from "node:crypto";

function hashPassword(pw: string) {
  return crypto.createHmac("sha256", ENV.JWT_SECRET).update(pw).digest("hex");
}

export function seedAdmin() {
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(ENV.ADMIN_EMAIL) as any;

  if (existing) {
    const hash = hashPassword(ENV.ADMIN_PASSWORD);
    db.prepare("UPDATE users SET role = 'admin', password_hash = ? WHERE id = ?").run(hash, existing.id);
    console.log(`[Seed] User ${ENV.ADMIN_EMAIL} promoted to admin (password synced).`);
  } else {
    const hash = hashPassword(ENV.ADMIN_PASSWORD);
    const info = db
      .prepare(
        "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')"
      )
      .run(ENV.ADMIN_EMAIL, hash);
    console.log(
      `[Seed] Admin user created: ${ENV.ADMIN_EMAIL} (id=${info.lastInsertRowid})`
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdmin();
}
