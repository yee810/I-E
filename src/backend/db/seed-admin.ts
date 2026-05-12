import db from "./connection.ts";
import { ENV } from "../config/env.ts";
import { hashPassword } from "../utils/auth.ts";

export function seedAdmin() {
  const { hash, salt } = hashPassword(ENV.ADMIN_PASSWORD);

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(ENV.ADMIN_EMAIL) as any;

  if (existing) {
    db.prepare(
      "UPDATE users SET role = 'admin', password_hash = ?, password_salt = ? WHERE id = ?"
    ).run(hash, salt, existing.id);
    console.log(
      `[Seed] User ${ENV.ADMIN_EMAIL} promoted to admin (password synced).`
    );
  } else {
    const info = db
      .prepare(
        "INSERT INTO users (email, password_hash, password_salt, role) VALUES (?, ?, ?, 'admin')"
      )
      .run(ENV.ADMIN_EMAIL, hash, salt);
    console.log(
      `[Seed] Admin user created: ${ENV.ADMIN_EMAIL} (id=${info.lastInsertRowid})`
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdmin();
}
