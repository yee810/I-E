import OpenAI from "openai";
import { ENV } from "../config/env.ts";

const openai = ENV.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: ENV.OPENAI_API_KEY,
      baseURL: ENV.OPENAI_BASE_URL || undefined,
    })
  : null;

export { openai };
