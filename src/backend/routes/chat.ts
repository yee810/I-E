import { Router } from "express";
import db from "../db/connection.ts";
import { openai } from "../services/openaiClient.ts";
import { ENV } from "../config/env.ts";
import { AppError } from "../utils/AppError.ts";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { user_id, message } = req.body;
    if (!user_id || !message) {
      throw new AppError("auth.missing_credentials", 400);
    }

    const history = db.prepare(
      "SELECT role, content FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
    ).all(user_id) as any[];

    // Filter out fallback/error messages so AI doesn't get confused
    const context = history
      .filter(h => !h.content.startsWith("[AI") && !h.content.startsWith("[AI temporarily"))
      .map(h => ({ role: h.role, content: h.content }));

    const systemPrompt = `You are Jobro, an AI career assistant. Help the user refine their job preferences through natural conversation. Be concise and friendly. Never claim you are offline or unavailable — you are currently active and ready to help.`;

    let reply = "";
    if (openai) {
      try {
        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...context.map(c => ({ role: c.role as "user" | "assistant", content: c.content })),
          { role: "user" as const, content: message },
        ];
        const response = await openai.chat.completions.create({
          model: ENV.OPENAI_MODEL,
          messages,
        });
        const raw = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
        // Strip <think>...</think> blocks and unclosed <think> blocks from reasoning models
        reply = raw
          .replace(/<think>[\s\S]*?<\/think>/g, "")
          .replace(/<think>[\s\S]*$/g, "")
          .replace(/^\s*<\/think>\s*/gm, "")
          .trim() || raw;
      } catch (aiErr: any) {
        console.error("[Chat] AI error:", aiErr.message || aiErr);
        reply = `[AI temporarily unavailable] ${aiErr.message || "Please try again later."}`;
      }
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
