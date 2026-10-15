// Shared helpers for the database scripts: load .env.local / .env (Next.js does this for the app,
// but plain Node scripts don't) and open a PostgreSQL connection.
import { existsSync, readFileSync } from "node:fs";
import pg from "pg";

export function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m || process.env[m[1]] !== undefined) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

/** Same rules as src/lib/server/db.ts: SSL for hosted databases (Supabase), none for localhost. */
export function dbConfig() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  const url = new URL(process.env.DATABASE_URL);
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  url.searchParams.delete("sslmode");
  return { connectionString: url.toString(), ssl: local || process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false } };
}

/** A connected client whose query() also accepts `?` placeholders, like the app's db helper. */
export async function connectDb() {
  const client = new pg.Client(dbConfig());
  await client.connect();
  return {
    query: (sql, params) => {
      if (!params) return client.query(sql); // plain SQL, may hold several statements
      let n = 0;
      return client.query(sql.replace(/\?/g, () => `$${++n}`), params);
    },
    end: () => client.end(),
  };
}
