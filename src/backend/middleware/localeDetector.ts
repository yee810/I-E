import { Request, Response, NextFunction } from "express";

const SUPPORTED_LOCALES = ["en", "zh-CN"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export function localeDetector(req: Request, _res: Response, next: NextFunction) {
  let locale: Locale = "en";

  const queryLang = req.query.lang as string;
  if (queryLang && SUPPORTED_LOCALES.includes(queryLang as Locale)) {
    locale = queryLang as Locale;
  } else if (req.headers["accept-language"]) {
    const accepted = req.headers["accept-language"];
    if (accepted.includes("zh-CN") || accepted.includes("zh-Hans")) {
      locale = "zh-CN";
    }
  }

  (req as any).locale = locale;
  next();
}
