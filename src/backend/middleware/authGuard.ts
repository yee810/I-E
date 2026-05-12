import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.ts";
import db from "../db/connection.ts";
import { AppError } from "../utils/AppError.ts";

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

  const { userId, valid } = verifyToken(token);
  if (!valid || !userId) {
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
