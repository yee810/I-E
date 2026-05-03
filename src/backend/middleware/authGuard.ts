import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env.ts";

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = auth.replace("Bearer ", "");
  // MVP no real JWT — simple bearer token check. See auth.ts for token generation.
  if (!token) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  (req as any).token = token;
  next();
}
