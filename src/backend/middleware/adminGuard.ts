import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

export function adminGuard(req: Request, _res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    next(new AppError("auth.insufficient_role", 403));
    return;
  }
  next();
}
