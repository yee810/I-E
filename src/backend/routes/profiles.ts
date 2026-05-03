import { Router } from "express";
import db from "../db/connection.ts";
import { parseCVFromBuffer } from "../services/cvParser.ts";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/me", (req, res, next) => {
  try {
    const userId = Number(req.query.user_id);
    if (!userId) {
      const err = new Error("Missing user_id") as any;
      err.statusCode = 400;
      throw err;
    }
    const row = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(userId) as any;
    if (!row) {
      res.json({ profile: null });
      return;
    }
    res.json({
      profile: {
        ...row,
        education: row.education ? JSON.parse(row.education) : [],
        experience: row.experience ? JSON.parse(row.experience) : [],
      },
    });
  } catch (e) {
    next(e);
  }
});

router.put("/me", (req, res, next) => {
  try {
    const { user_id, name, education, experience, skills, raw_resume_text } = req.body;
    if (!user_id) {
      const err = new Error("Missing user_id") as any;
      err.statusCode = 400;
      throw err;
    }
    const insert = db.prepare(`
      INSERT INTO profiles (user_id, name, education, experience, skills, raw_resume_text)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        name = excluded.name,
        education = excluded.education,
        experience = excluded.experience,
        skills = excluded.skills,
        raw_resume_text = excluded.raw_resume_text,
        updated_at = CURRENT_TIMESTAMP
    `);
    insert.run(
      user_id,
      name ?? null,
      education ? JSON.stringify(education) : null,
      experience ? JSON.stringify(experience) : null,
      skills ?? null,
      raw_resume_text ?? null
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.post("/resume-upload", upload.single("file"), async (req, res, next) => {
  try {
    const user_id = Number(req.body.user_id);
    if (!user_id) {
      const err = new Error("Missing user_id") as any;
      err.statusCode = 400;
      throw err;
    }
    if (!req.file || req.file.mimetype !== "application/pdf") {
      const err = new Error("Only PDF files are allowed") as any;
      err.statusCode = 400;
      throw err;
    }
    const parsed = await parseCVFromBuffer(req.file.buffer);

    const insert = db.prepare(`
      INSERT INTO profiles (user_id, name, education, experience, skills, raw_resume_text)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        name = excluded.name,
        education = excluded.education,
        experience = excluded.experience,
        skills = excluded.skills,
        raw_resume_text = excluded.raw_resume_text,
        updated_at = CURRENT_TIMESTAMP
    `);
    insert.run(
      user_id,
      parsed.name,
      parsed.education ? JSON.stringify(parsed.education) : null,
      parsed.experience ? JSON.stringify(parsed.experience) : null,
      parsed.skills ? JSON.stringify(parsed.skills) : null,
      parsed.rawResumeText ?? null
    );

    res.json({ ok: true, parsed });
  } catch (e) {
    next(e);
  }
});

export default router;
