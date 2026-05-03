import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[Error]", err);
  const code = (err as any).statusCode ?? 500;
  res.status(code).json({ error: err.message || "Internal Server Error", code });
}
