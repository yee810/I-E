import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env.ts";
import db from "../db/connection.ts";
import crypto from "node:crypto";
import { AppError } from "../utils/AppError.ts";

function generateToken(userId: number) {
  const time = Math.floor(Date.now() / 1000 / 3600);
  return crypto
    .createHmac("sha256", ENV.JWT_SECRET)
    .update(`${userId}:${time}`)
    .digest("hex");
}

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    next(new AppError("auth.missing_token", 401));
    return;
  }

  const token = auth.replace("Bearer ", "");
  if (!token) {
    next(new AppError("auth.invalid_token", 401));
    return;
  }

  const userId =
    req.headers["x-user-id"] ?? req.query.user_id ?? req.body?.user_id;
  if (!userId) {
    next(new AppError("auth.no_user_context", 401));
    return;
  }

  const expected = generateToken(Number(userId));
  if (token !== expected) {
    next(new AppError("auth.invalid_token", 401));
    return;
  }

  const user = db
    .prepare("SELECT id, email, role FROM users WHERE id = ?")
    .get(userId) as any;
  if (!user) {
    next(new AppError("auth.user_not_found", 401));
    return;
  }

  (req as any).user = user;
  next();
}
