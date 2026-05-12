import db from "../db/connection.ts";
import { parsePagination, PaginationOptions } from "../utils/pagination.ts";
import fs from "node:fs";

const AUDIT_SORT_COLUMNS = ["id", "action", "created_at"];

export function getHealth() {
  let dbSize = 0;
  try {
    const stat = fs.statSync((db as any).name ?? "./jobro.db");
    dbSize = stat.size;
  } catch {}

  const totalUsers = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c;
  const totalJobs = (db.prepare("SELECT COUNT(*) as c FROM jobs").get() as any).c;

  return {
    db: "ok",
    dbSize,
    totalUsers,
    totalJobs,
    uptime: process.uptime(),
    env: process.env.NODE_ENV ?? "development",
    aiEnabled: !!process.env.OPENAI_API_KEY,
  };
}

export function getAllConfig() {
  return db.prepare("SELECT key, value, description, updated_at FROM system_config").all() as any[];
}

export function getConfig(key: string) {
  return db.prepare("SELECT key, value, description, updated_at FROM system_config WHERE key = ?").get(key) as any;
}

export function updateConfig(key: string, value: string, adminId: number) {
  db.prepare(
    "UPDATE system_config SET value = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE key = ?"
  ).run(value, adminId, key);
  return getConfig(key);
}

export function getAuditLog(
  options: PaginationOptions & { adminId?: number; action?: string }
) {
  const { page, limit, offset, order, sort } = parsePagination({
    ...options,
    allowedSortColumns: AUDIT_SORT_COLUMNS,
  });

  const conditions: string[] = [];
  const params: any[] = [];

  if (options.adminId) {
    conditions.push("admin_id = ?");
    params.push(options.adminId);
  }
  if (options.action) {
    conditions.push("action LIKE ?");
    params.push(`%${options.action}%`);
  }

  const where = conditions.length > 0 ? conditions.join(" AND ") : "1=1";

  const countRow = db
    .prepare(`SELECT COUNT(*) as total FROM admin_audit_log WHERE ${where}`)
    .get(...params) as any;

  const logs = db
    .prepare(
      `SELECT admin_audit_log.*, users.email as admin_email
       FROM admin_audit_log
       LEFT JOIN users ON admin_audit_log.admin_id = users.id
       WHERE ${where}
       ORDER BY admin_audit_log.${sort} ${order}
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as any[];

  return {
    data: logs,
    total: countRow.total,
    page,
    totalPages: Math.ceil(countRow.total / limit),
  };
}

export function logAction(
  adminId: number,
  action: string,
  targetType?: string,
  targetId?: number,
  details?: any
) {
  db.prepare(
    "INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)"
  ).run(adminId, action, targetType ?? null, targetId ?? null, details ? JSON.stringify(details) : null);
}
