// Shared helpers for the database scripts: load .env.local / .env (Next.js does this for the app,
// but plain Node scripts don't) and open a MySQL connection.
import { existsSync, readFileSync } from "node:fs";
import mysql from "mysql2/promise";

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

export function dbConfig() {
  return {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "cpk",
  };
}

/** Connection to the server (no database selected), for CREATE DATABASE. */
export async function connectServer() {
  const { database, ...cfg } = dbConfig();
  return { conn: await mysql.createConnection({ ...cfg, multipleStatements: true, charset: "utf8mb4" }), database };
}

export async function connectDb() {
  return mysql.createConnection({ ...dbConfig(), multipleStatements: true, charset: "utf8mb4", dateStrings: true });
}
