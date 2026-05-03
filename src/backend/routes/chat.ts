import { Router } from "express";
import db from "../db/connection.ts";
import { GoogleGenAI } from "@google/genai";
import { ENV } from "../config/env.ts";

const router = Router();
const ai = ENV.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY }) : null;

router.post("/", async (req, res, next) => {
  try {
    const { user_id, message } = req.body;
    if (!user_id || !message) {
      const err = new Error("Missing user_id or message") as any;
      err.statusCode = 400;
      throw err;
    }

    const history = db.prepare(
      "SELECT role, content FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
    ).all(user_id) as any[];
    const context = history.map(h => ({ role: h.role, content: h.content }));

    const systemPrompt = `You are Jobro, an AI career assistant. Help the user refine their job preferences through natural conversation. Be concise and friendly.`;

    let reply = "";
    if (ai) {
      const contents = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...context.map(c => ({ role: c.role as "user" | "model", parts: [{ text: c.content }] })),
        { role: "user", parts: [{ text: message }] },
      ];
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-thinking-exp",
        contents,
      });
      reply = response.text || "I'm sorry, I couldn't process that.";
    } else {
      reply = "[AI is offline] Understood. I'll note your preference when AI is back.";
    }

    const insert = db.prepare("INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)");
    insert.run(user_id, "user", message);
    insert.run(user_id, "assistant", reply);

    res.json({ reply, user_id });
  } catch (e) {
    next(e);
  }
});

export default router;
