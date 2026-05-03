import db from "../db/connection.ts";

export function track(event_type: string, user_id?: number, payload?: Record<string, any>) {
  try {
    const insert = db.prepare("INSERT INTO events (event_type, user_id, payload) VALUES (?, ?, ?)");
    insert.run(event_type, user_id ?? null, payload ? JSON.stringify(payload) : null);
  } catch (e) {
    console.error("[EventTracker] Failed to track event:", e);
  }
}
