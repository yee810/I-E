import crypto from "node:crypto";
import { ENV } from "../config/env.ts";

// --- Password hashing (scrypt with per-user salt) ---

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, salt, 64);
  return { hash: key.toString("hex"), salt };
}

export function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): boolean {
  const key = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(storedHash, "hex");
  if (key.length !== stored.length) return false;
  return crypto.timingSafeEqual(key, stored);
}

/** Legacy HMAC-SHA256 verification for users created before the scrypt migration. */
export function verifyLegacyPassword(
  password: string,
  storedHash: string
): boolean {
  const expected = crypto
    .createHmac("sha256", ENV.JWT_SECRET)
    .update(password)
    .digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// --- Token generation and verification (userId embedded in token) ---

function encodePart(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function decodePart(encoded: string): string {
  return Buffer.from(encoded, "base64url").toString("utf-8");
}

export function generateToken(userId: number): string {
  const time = Math.floor(Date.now() / 1000 / 3600);
  const payload = `${userId}:${time}`;
  const signature = crypto
    .createHmac("sha256", ENV.TOKEN_SECRET)
    .update(payload)
    .digest("hex");
  return `${encodePart(String(userId))}:${encodePart(String(time))}:${signature}`;
}

export function verifyToken(
  token: string
): { userId: number; valid: boolean } {
  const parts = token.split(":");
  if (parts.length !== 3) return { userId: 0, valid: false };

  const [encodedUserId, encodedTime, signature] = parts;

  let userId: number;
  let time: string;
  try {
    userId = Number(decodePart(encodedUserId));
    time = decodePart(encodedTime);
  } catch {
    return { userId: 0, valid: false };
  }

  if (!Number.isFinite(userId) || userId <= 0) {
    return { userId: 0, valid: false };
  }

  const payload = `${userId}:${time}`;
  const expected = crypto
    .createHmac("sha256", ENV.TOKEN_SECRET)
    .update(payload)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length) return { userId: 0, valid: false };

  if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { userId: 0, valid: false };
  }

  return { userId, valid: true };
}
