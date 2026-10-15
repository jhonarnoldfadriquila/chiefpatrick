// PostgreSQL connection pool (server-only), e.g. Supabase. All queries go through `query`/`exec`
// with `?` placeholders (turned into $1, $2, ... here), so values are always sent as parameters and
// never concatenated into SQL.
import pg from "pg";

declare global {
  // Reuse one pool across hot reloads in development.
  var __cpkPool: pg.Pool | undefined;
}

// Dates and timestamps come back as plain strings ("2025-06-01", "2025-06-01 18:00:00"), counts and
// other bigints as numbers.
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (v) => v.slice(0, 19));
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => Number(v));

/** Connection settings from DATABASE_URL (Supabase: Project Settings → Database → Connection string). */
export function connectionConfig(): pg.PoolConfig {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw Object.assign(new Error("DATABASE_URL is not set"), { code: "NO_DATABASE_URL" });
  const url = new URL(raw);
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  // Hosted databases (Supabase) require SSL; their pooler certificates aren't in Node's CA list.
  url.searchParams.delete("sslmode");
  return { connectionString: url.toString(), ssl: local || process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false } };
}

export function pool(): pg.Pool {
  if (!globalThis.__cpkPool) {
    globalThis.__cpkPool = new pg.Pool({ ...connectionConfig(), max: 10, connectionTimeoutMillis: 5000 });
  }
  return globalThis.__cpkPool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

/** Turns `?` placeholders into $1, $2, ... (skipping any inside quoted strings). */
function numbered(sql: string): string {
  let n = 0;
  let quoted = false;
  let out = "";
  for (const ch of sql) {
    if (ch === "'") quoted = !quoted;
    out += ch === "?" && !quoted ? `$${++n}` : ch;
  }
  return out;
}

export async function query<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool().query(numbered(sql), params);
  return result.rows as T[];
}

export async function queryOne<T = Row>(sql: string, params: unknown[] = []): Promise<T | null> {
  return (await query<T>(sql, params))[0] ?? null;
}

/** Runs an INSERT / UPDATE / DELETE. INSERTs return the new row's id as `insertId`. */
export async function exec(sql: string, params: unknown[] = []): Promise<{ insertId: number; affectedRows: number }> {
  const isInsert = /^\s*INSERT\b/i.test(sql) && !/\bRETURNING\b/i.test(sql);
  const result = await pool().query(numbered(isInsert ? `${sql} RETURNING *` : sql), params);
  return { insertId: Number(result.rows[0]?.id ?? 0), affectedRows: result.rowCount ?? 0 };
}

/** JSON columns: parsed objects from jsonb, but tolerate a string too. */
export function json<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
