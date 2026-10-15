import { exec, query, queryOne } from "@/lib/server/db";
import { hashPassword, verifyPassword, type Role } from "@/lib/server/auth";
import type { UserRecord } from "@/types/admin";

export async function listUsers(): Promise<UserRecord[]> {
  const rows = await query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at");
  return rows.map((r) => ({ id: r.id, name: r.name, email: r.email, role: r.role, createdAt: r.created_at }));
}

export async function createUser(d: { name: string; email: string; password: string; role: Role }) {
  const r = await exec("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [d.name, d.email, await hashPassword(d.password), d.role]);
  return r.insertId;
}

export async function deleteUser(id: number) {
  await exec("DELETE FROM users WHERE id = ?", [id]);
}

export async function adminCount() {
  const [r] = await query<{ n: number }>("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'");
  return Number(r.n);
}

/** Changes a user's own password after checking the current one. */
export async function changePassword(id: number, current: string, next: string): Promise<boolean> {
  const row = await queryOne<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", [id]);
  if (!row || !(await verifyPassword(current, row.password_hash))) return false;
  await exec("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(next), id]);
  await exec("DELETE FROM sessions WHERE user_id = ?", [id]); // sign out other devices
  return true;
}
