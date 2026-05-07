import db from "../db/connection.ts";

export function getOverview() {
  const totalUsers = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c;
  const totalJobs = (db.prepare("SELECT COUNT(*) as c FROM jobs").get() as any).c;
  const totalMatches = (db.prepare("SELECT COUNT(*) as c FROM matches").get() as any).c;
  const activeJobs = (db.prepare("SELECT COUNT(*) as c FROM jobs WHERE status = 'active'").get() as any).c;
  const pendingMatches = (db.prepare("SELECT COUNT(*) as c FROM matches WHERE status = 'pending'").get() as any).c;

  const avgRow = db.prepare("SELECT AVG(match_score) as avg FROM matches").get() as any;
  const avgMatchScore = avgRow?.avg ?? 0;

  return { totalUsers, totalJobs, totalMatches, activeJobs, pendingMatches, avgMatchScore: Math.round(avgMatchScore * 100) / 100 };
}

export function getUsersOverTime(days: number = 30) {
  const rows = db
    .prepare(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= DATE('now', ? || ' days')
       GROUP BY DATE(created_at)
       ORDER BY date`
    )
    .all(`-${days}`) as any[];
  return { data: rows };
}

export function getJobsByIndustry() {
  const rows = db
    .prepare(
      `SELECT COALESCE(industry, 'Uncategorized') as industry, COUNT(*) as count
       FROM jobs
       GROUP BY industry
       ORDER BY count DESC`
    )
    .all() as any[];
  return { data: rows };
}

export function getMatchStats() {
  const byStatus = db
    .prepare(
      `SELECT status, COUNT(*) as count FROM matches GROUP BY status`
    )
    .all() as any[];

  const avgRow = db.prepare("SELECT AVG(match_score) as avg FROM matches").get() as any;
  return { byStatus, avgScore: Math.round((avgRow?.avg ?? 0) * 100) / 100 };
}

export function getEventAggregation(eventType?: string, days: number = 30) {
  let where = "WHERE created_at >= DATE('now', ? || ' days')";
  const params: any[] = [`-${days}`];

  if (eventType) {
    where += " AND event_type = ?";
    params.push(eventType);
  }

  const rows = db
    .prepare(
      `SELECT DATE(created_at) as date, event_type, COUNT(*) as count
       FROM events ${where}
       GROUP BY DATE(created_at), event_type
       ORDER BY date`
    )
    .all(...params) as any[];

  return { data: rows };
}

export function getChatUsage(days: number = 30) {
  const rows = db
    .prepare(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM conversations
       WHERE created_at >= DATE('now', ? || ' days')
       GROUP BY DATE(created_at)
       ORDER BY date`
    )
    .all(`-${days}`) as any[];
  return { data: rows };
}
