// npm run db:setup [-- --reset-content]
//
// 1. Creates the database (DB_NAME) if it doesn't exist.
// 2. Applies database/schema.sql (CREATE TABLE IF NOT EXISTS — safe to re-run).
// 3. Loads database/seed.sql (the site's real content) the first time, or again with --reset-content.
// 4. Creates the first admin account from ADMIN_EMAIL / ADMIN_PASSWORD if no users exist yet.
import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { connectDb, connectServer, loadEnv } from "./db-lib.mjs";

loadEnv();
const reset = process.argv.includes("--reset-content");

const { conn: server, database } = await connectServer();
if (!/^[A-Za-z0-9_]+$/.test(database)) throw new Error(`DB_NAME "${database}" may only contain letters, numbers and _`);
await server.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await server.end();
console.log(`✓ database "${database}"`);

const db = await connectDb();
await db.query(readFileSync("database/schema.sql", "utf8"));
console.log("✓ schema");

const [[{ n: categories }]] = await db.query("SELECT COUNT(*) AS n FROM menu_categories");
if (categories === 0 || reset) {
  await db.query(readFileSync("database/seed.sql", "utf8"));
  console.log(reset ? "✓ content reset from database/seed.sql" : "✓ content loaded from database/seed.sql");
} else {
  console.log("• content already present (use --reset-content to reload it)");
}

const [[{ n: users }]] = await db.query("SELECT COUNT(*) AS n FROM users");
if (users === 0) {
  const email = (process.env.ADMIN_EMAIL || "admin@chefpatrickskitchen.ph").toLowerCase();
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = "ChangeMe-" + Math.random().toString(36).slice(2, 8);
    console.log(`! ADMIN_PASSWORD is not set; generated a temporary password: ${password}`);
  }
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  await db.query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')", [
    process.env.ADMIN_NAME || "Admin",
    email,
    await bcrypt.hash(password, 12),
  ]);
  console.log(`✓ admin account ${email}`);
} else {
  console.log(`• ${users} user account(s) already exist`);
}

await db.end();
console.log("Done.");
