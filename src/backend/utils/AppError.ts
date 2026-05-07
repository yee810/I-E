import { t } from "../i18n/index.ts";

export class AppError extends Error {
  public readonly key: string;
  public readonly statusCode: number;
  public readonly params?: Record<string, any>;

  constructor(key: string, statusCode: number = 400, params?: Record<string, any>) {
    super(key);
    this.key = key;
    this.statusCode = statusCode;
    this.params = params;
  }

  toJSON(locale: string = "en") {
    return {
      error: this.key,
      message: t(this.key, locale, this.params),
    };
  }
}
