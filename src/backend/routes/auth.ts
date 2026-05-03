import { Router } from "express";
import db from "../db/connection.ts";
import { ENV } from "../config/env.ts";
import crypto from "node:crypto";

const router = Router();

function hashPassword(pw: string) {
  return crypto.createHmac("sha256", ENV.JWT_SECRET).update(pw).digest("hex");
}

function generateToken(_userId: number) {
  const time = Math.floor(Date.now() / 1000 / 3600); // rotate every hour
  return crypto.createHmac("sha256", ENV.JWT_SECRET).update(String(time)).digest("hex");
}

router.post("/register", (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const err = new Error("Missing email or password") as any;
      err.statusCode = 400;
      throw err;
    }
    const password_hash = hashPassword(password);
    const insert = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
    const info = insert.run(email, password_hash);
    const token = generateToken(Number(info.lastInsertRowid));
    res.json({ token, user: { id: info.lastInsertRowid, email } });
  } catch (e) {
    next(e);
  }
});

router.post("/login", (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const err = new Error("Missing email or password") as any;
      err.statusCode = 400;
      throw err;
    }
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!row) {
      const err = new Error("User not found") as any;
      err.statusCode = 404;
      throw err;
    }
    if (row.password_hash !== hashPassword(password)) {
      const err = new Error("Invalid password") as any;
      err.statusCode = 401;
      throw err;
    }
    const token = generateToken(row.id);
    res.json({ token, user: { id: row.id, email: row.email } });
  } catch (e) {
    next(e);
  }
});

export default router;
