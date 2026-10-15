// MySQL connection pool (server-only). All queries go through `query`/`exec` with `?` placeholders,
// so values are always sent as parameters and never concatenated into SQL.
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

declare global {
  // Reuse one pool across hot reloads in development.
  var __cpkPool: Pool | undefined;
}

export function pool(): Pool {
  if (!globalThis.__cpkPool) {
    globalThis.__cpkPool = mysql.createPool({
      host: process.env.DB_HOST ?? "127.0.0.1",
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "cpk",
      charset: "utf8mb4",
      connectionLimit: 10,
      dateStrings: true, // DATE / DATETIME come back as strings, no timezone surprises
      connectTimeout: 4000,
    });
  }
  return globalThis.__cpkPool;
}

export type Row = RowDataPacket;

export async function query<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool().query<RowDataPacket[]>(sql, params);
  return rows as unknown as T[];
}

export async function queryOne<T = Row>(sql: string, params: unknown[] = []): Promise<T | null> {
  return (await query<T>(sql, params))[0] ?? null;
}

export async function exec(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await pool().execute<ResultSetHeader>(sql, params as never[]);
  return result;
}

/** MySQL JSON columns may arrive parsed or as a string depending on the server (MariaDB: string). */
export function json<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
