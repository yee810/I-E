import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPPORTED_LOCALES = ["en", "zh-CN"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

function loadLocale(name: string): any {
  try {
    return JSON.parse(readFileSync(join(__dirname, "locales", `${name}.json`), "utf-8"));
  } catch {
    return {};
  }
}

const translations: Record<string, any> = {
  en: loadLocale("en"),
  "zh-CN": loadLocale("zh-CN"),
};

export function t(
  key: string,
  locale: string = "en",
  params?: Record<string, any>
): string {
  const parts = key.split(".");
  let value: any = translations[locale] ?? translations["en"];
  for (const part of parts) {
    value = value?.[part];
  }
  if (typeof value !== "string") {
    value = translations["en"];
    for (const part of parts) {
      value = value?.[part];
    }
  }
  if (typeof value !== "string") return key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = (value as string).replace(
        new RegExp(`\\{${k}\\}`, "g"),
        String(v)
      );
    }
  }
  return value;
}
