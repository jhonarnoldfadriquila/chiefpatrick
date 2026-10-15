// Staff accounts and sessions (server-only).
//
// - Passwords are hashed with bcrypt (cost 12).
// - A session is a random 256-bit token in an httpOnly cookie; only its SHA-256 hash is stored in
//   the `sessions` table, so a leaked database can't be used to sign in.
// - Login attempts are rate limited per IP and per email.
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { exec, queryOne } from "@/lib/server/db";

export type Role = "admin" | "staff";
export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

const COOKIE = "cpk_session";
const SESSION_DAYS = 7;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// A real bcrypt hash of a random string, compared against when an email is unknown so a failed
// login takes the same time either way and doesn't reveal which emails exist.
let dummyHash: string | null = null;
const dummy = () => (dummyHash ??= bcrypt.hashSync(randomBytes(16).toString("hex"), 12));

// ---------- rate limiting (in memory, per server process) ----------

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 8;

/** Returns false once a key has made too many attempts in the window. */
export function rateLimit(key: string, max = MAX_ATTEMPTS, windowMs = WINDOW_MS): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > windowMs) {
    attempts.set(key, { count: 1, first: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

// ---------- sessions ----------

export async function login(email: string, password: string): Promise<SessionUser | null> {
  const user = await queryOne<SessionUser & { password_hash: string }>(
    "SELECT id, name, email, role, password_hash FROM users WHERE email = ?",
    [email.trim().toLowerCase()],
  );
  const valid = await bcrypt.compare(password, user?.password_hash ?? dummy());
  if (!user || !valid) return null;

  const token = randomBytes(32).toString("hex");
  await exec("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, NOW() + ?::int * INTERVAL '1 day')", [sha256(token), user.id, SESSION_DAYS]);
  await exec("DELETE FROM sessions WHERE expires_at < NOW()");
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await exec("DELETE FROM sessions WHERE token_hash = ?", [sha256(token)]).catch(() => {});
  jar.delete(COOKIE);
}

// Dev shortcut: ADMIN_AUTH_DISABLED=true skips sign-in and acts as the first admin account.
// Ignored in production so a deployed site can never be left open by accident.
export const authDisabled = process.env.ADMIN_AUTH_DISABLED === "true" && process.env.NODE_ENV !== "production";
const GUEST_ADMIN: SessionUser = { id: 0, name: "Admin (no login)", email: "admin@localhost", role: "admin" };

export async function currentUser(): Promise<SessionUser | null> {
  if (authDisabled) {
    const admin = await queryOne<SessionUser>("SELECT id, name, email, role FROM users WHERE role = 'admin' ORDER BY id LIMIT 1").catch(() => null);
    return admin ?? GUEST_ADMIN;
  }
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return queryOne<SessionUser>(
    "SELECT u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > NOW()",
    [sha256(token)],
  );
}

/** For admin pages (server components): sends signed-out visitors to the login page. */
export async function requireUser(role: Role = "staff"): Promise<SessionUser> {
  let user: SessionUser | null = null;
  try {
    user = await currentUser();
  } catch {
    redirect("/admin/login?db=down");
  }
  if (!user) redirect("/admin/login");
  if (role === "admin" && user.role !== "admin") redirect("/admin");
  return user;
}

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);
