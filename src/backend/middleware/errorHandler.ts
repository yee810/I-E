import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";
import { t } from "../i18n/index.ts";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[Error]", err);
  const locale = (req as any).locale ?? "en";

  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON(locale));
    return;
  }

  const code = (err as any).statusCode ?? 500;
  res.status(code).json({
    error: err.message || "internal.server_error",
    message: err.message || t("internal.server_error", locale),
  });
}
