// npm run db:setup [-- --reset-content]
//
// 1. Applies database/schema.sql (CREATE TABLE IF NOT EXISTS — safe to re-run).
// 2. Loads database/seed.sql (the site's real content) the first time, or again with --reset-content.
// 3. Creates the first admin account from ADMIN_EMAIL / ADMIN_PASSWORD if no users exist yet.
//
// The database itself comes from DATABASE_URL (on Supabase it already exists: "postgres").
import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { connectDb, loadEnv } from "./db-lib.mjs";

loadEnv();
const reset = process.argv.includes("--reset-content");

const db = await connectDb();
await db.query(readFileSync("database/schema.sql", "utf8"));
console.log("✓ schema");

const { rows: [{ n: categories }] } = await db.query("SELECT COUNT(*)::int AS n FROM menu_categories");
if (categories === 0 || reset) {
  await db.query(readFileSync("database/seed.sql", "utf8"));
  console.log(reset ? "✓ content reset from database/seed.sql" : "✓ content loaded from database/seed.sql");
} else {
  console.log("• content already present (use --reset-content to reload it)");
}

const { rows: [{ n: users }] } = await db.query("SELECT COUNT(*)::int AS n FROM users");
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
