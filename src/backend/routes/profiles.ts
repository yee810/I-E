import { Router } from "express";
import db from "../db/connection.ts";
import { parseCVFromBuffer } from "../services/cvParser.ts";
import { AppError } from "../utils/AppError.ts";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/me", (req, res, next) => {
  try {
    const userId = (req as any).user.id;
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
        skills: row.skills ? JSON.parse(row.skills) : [],
      },
    });
  } catch (e) {
    next(e);
  }
});

router.put("/me", (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { name, education, experience, skills, raw_resume_text } = req.body;
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
      userId,
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
    const userId = (req as any).user.id;
    if (!req.file || req.file.mimetype !== "application/pdf") {
      throw new AppError("profile.pdf_required", 400);
    }
    const result = await parseCVFromBuffer(req.file.buffer);
    const { parsed, method, error } = result;

    console.log(`[CV Parse] user=${userId} method=${method} name="${parsed.name}" skills=${parsed.skills?.length || 0} edu=${parsed.education?.length || 0} exp=${parsed.experience?.length || 0} text_len=${parsed.rawResumeText?.length || 0}${error ? ` error="${error}"` : ""}`);

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
      userId,
      parsed.name,
      parsed.education ? JSON.stringify(parsed.education) : null,
      parsed.experience ? JSON.stringify(parsed.experience) : null,
      parsed.skills ? JSON.stringify(parsed.skills) : null,
      parsed.rawResumeText ?? null
    );

    res.json({ ok: true, parsed, method, error });
  } catch (e) {
    next(e);
  }
});

export default router;
