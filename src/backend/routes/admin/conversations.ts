import { Router } from "express";
import db from "../../db/connection.ts";
import { parsePagination } from "../../utils/pagination.ts";

const router = Router();

router.get("/conversations", (req, res, next) => {
  try {
    const { page, limit, offset, order } = parsePagination({
      page: Number(req.query.page) || undefined,
      limit: Number(req.query.limit) || undefined,
      order: req.query.order as any || undefined,
    });

    const conditions: string[] = [];
    const params: any[] = [];

    if (req.query.user_id) {
      conditions.push("conversations.user_id = ?");
      params.push(Number(req.query.user_id));
    }
    if (req.query.search) {
      conditions.push("content LIKE ?");
      params.push(`%${req.query.search}%`);
    }

    const where = conditions.length > 0 ? conditions.join(" AND ") : "1=1";

    const countRow = db
      .prepare(`SELECT COUNT(*) as total FROM conversations WHERE ${where}`)
      .get(...params) as any;

    const conversations = db
      .prepare(
        `SELECT conversations.*, users.email
         FROM conversations
         LEFT JOIN users ON conversations.user_id = users.id
         WHERE ${where}
         ORDER BY conversations.created_at ${order}
         LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset) as any[];

    res.json({
      data: conversations,
      total: countRow.total,
      page,
      totalPages: Math.ceil(countRow.total / limit),
    });
  } catch (e) { next(e); }
});

export default router;
