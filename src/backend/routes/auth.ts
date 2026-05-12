import { Router } from "express";
import db from "../db/connection.ts";
import { AppError } from "../utils/AppError.ts";
import {
  hashPassword,
  verifyPassword,
  verifyLegacyPassword,
  generateToken,
} from "../utils/auth.ts";
import { authGuard } from "../middleware/authGuard.ts";

const router = Router();

router.post("/register", (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("auth.missing_credentials", 400);
    }
    const { hash, salt } = hashPassword(password);
    const insert = db.prepare(
      "INSERT INTO users (email, password_hash, password_salt) VALUES (?, ?, ?)"
    );
    const info = insert.run(email, hash, salt);
    const token = generateToken(Number(info.lastInsertRowid));
    res.json({
      token,
      user: { id: info.lastInsertRowid, email, role: "user" },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/login", (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("auth.missing_credentials", 400);
    }
    const row = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as any;
    if (!row) {
      throw new AppError("auth.user_not_found", 404);
    }

    let valid = false;
    if (row.password_salt) {
      valid = verifyPassword(password, row.password_hash, row.password_salt);
    } else {
      // Legacy HMAC-SHA256 migration path
      valid = verifyLegacyPassword(password, row.password_hash);
      if (valid) {
        const { hash, salt } = hashPassword(password);
        db.prepare(
          "UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?"
        ).run(hash, salt, row.id);
      }
    }

    if (!valid) {
      throw new AppError("auth.invalid_password", 401);
    }
    const token = generateToken(row.id);
    const profile = db.prepare("SELECT 1 FROM profiles WHERE user_id = ?").get(row.id);
    const preferences = db.prepare("SELECT 1 FROM preferences WHERE user_id = ?").get(row.id);
    const onboardingComplete = !!(profile && preferences);
    res.json({ token, user: { id: row.id, email: row.email, role: row.role, onboardingComplete } });
  } catch (e) {
    next(e);
  }
});

router.delete("/account", authGuard, (req, res, next) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("auth.missing_token", 401);
    }

    const deleteAll = db.transaction(() => {
      db.prepare("DELETE FROM conversations WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM matches WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM preferences WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM profiles WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM events WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    });
    deleteAll();

    console.log(`[Auth] Account deleted: user_id=${userId}`);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
