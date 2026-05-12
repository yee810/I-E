import db from "../db/connection.ts";
import { parsePagination, PaginationOptions } from "../utils/pagination.ts";

const MATCH_SORT_COLUMNS = ["id", "match_score", "status", "created_at"];

export function listMatches(
  options: PaginationOptions & {
    status?: string;
    userId?: number;
    jobId?: number;
    minScore?: number;
  }
) {
  const { page, limit, offset, order, sort } = parsePagination({
    ...options,
    allowedSortColumns: MATCH_SORT_COLUMNS,
  });

  const conditions: string[] = [];
  const params: any[] = [];

  if (options.status) {
    conditions.push("matches.status = ?");
    params.push(options.status);
  }
  if (options.userId) {
    conditions.push("matches.user_id = ?");
    params.push(options.userId);
  }
  if (options.jobId) {
    conditions.push("matches.job_id = ?");
    params.push(options.jobId);
  }
  if (options.minScore !== undefined) {
    conditions.push("matches.match_score >= ?");
    params.push(options.minScore);
  }

  const where = conditions.length > 0 ? conditions.join(" AND ") : "1=1";

  const countRow = db
    .prepare(`SELECT COUNT(*) as total FROM matches WHERE ${where}`)
    .get(...params) as any;

  const matches = db
    .prepare(
      `SELECT matches.*, users.email, jobs.title, jobs.company
       FROM matches
       LEFT JOIN users ON matches.user_id = users.id
       LEFT JOIN jobs ON matches.job_id = jobs.id
       WHERE ${where}
       ORDER BY matches.${sort} ${order}
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as any[];

  return {
    data: matches,
    total: countRow.total,
    page,
    totalPages: Math.ceil(countRow.total / limit),
  };
}

export function getMatch(id: number) {
  return db
    .prepare(
      `SELECT matches.*, users.email, jobs.title, jobs.company
       FROM matches
       LEFT JOIN users ON matches.user_id = users.id
       LEFT JOIN jobs ON matches.job_id = jobs.id
       WHERE matches.id = ?`
    )
    .get(id) as any;
}

export function updateMatchStatus(id: number, status: string) {
  db.prepare("UPDATE matches SET status = ? WHERE id = ?").run(status, id);
  return getMatch(id);
}

export function deleteMatch(id: number) {
  db.prepare("DELETE FROM matches WHERE id = ?").run(id);
}

export function bulkUpdateMatchStatus(ids: number[], status: string) {
  const placeholders = ids.map(() => "?").join(",");
  const info = db
    .prepare(`UPDATE matches SET status = ? WHERE id IN (${placeholders})`)
    .run(status, ...ids);
  return info.changes;
}
