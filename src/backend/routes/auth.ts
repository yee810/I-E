import { Router } from "express";
import db from "../db/connection.ts";
import { ENV } from "../config/env.ts";
import crypto from "node:crypto";
import { AppError } from "../utils/AppError.ts";

const router = Router();

function hashPassword(pw: string) {
  return crypto.createHmac("sha256", ENV.JWT_SECRET).update(pw).digest("hex");
}

function generateToken(userId: number) {
  const time = Math.floor(Date.now() / 1000 / 3600); // rotate every hour
  return crypto.createHmac("sha256", ENV.JWT_SECRET).update(`${userId}:${time}`).digest("hex");
}

router.post("/register", (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("auth.missing_credentials", 400);
    }
    const password_hash = hashPassword(password);
    const insert = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
    const info = insert.run(email, password_hash);
    const token = generateToken(Number(info.lastInsertRowid));
    res.json({ token, user: { id: info.lastInsertRowid, email, role: "user" } });
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
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!row) {
      throw new AppError("auth.user_not_found", 404);
    }
    if (row.password_hash !== hashPassword(password)) {
      throw new AppError("auth.invalid_password", 401);
    }
    const token = generateToken(row.id);
    res.json({ token, user: { id: row.id, email: row.email, role: row.role } });
  } catch (e) {
    next(e);
  }
});

export default router;
