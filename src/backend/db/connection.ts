import Database from "better-sqlite3";
import { ENV } from "../config/env.ts";

const db = new Database(ENV.DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export default db;
