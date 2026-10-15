// Consistent API responses and central error handling for every route under /api.
//
//   success: { ok: true, data, meta? }
//   failure: { ok: false, error: "Human message", fields?: { field: "problem" } }
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentUser, type Role, type SessionUser } from "@/lib/server/auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export const ok = <T>(data: T, meta?: Record<string, unknown>, status = 200) =>
  NextResponse.json({ ok: true, data, ...(meta ? { meta } : {}) }, { status });

export const fail = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ ok: false, error, ...(fields ? { fields } : {}) }, { status });

interface Ctx<P> {
  req: Request;
  params: P;
  user: SessionUser | null;
}

/**
 * Wraps a route handler: optional auth/role check, then runs it and turns thrown errors into JSON.
 *   export const GET = route(async ({ req }) => ok(...), { auth: "staff" });
 */
export function route<P = Record<string, string>>(
  fn: (ctx: Ctx<P>) => Promise<Response>,
  opts: { auth?: Role | false } = {},
) {
  return async (req: Request, context: { params: Promise<P> }) => {
    try {
      const user = opts.auth ? await currentUser() : null;
      if (opts.auth) {
        if (!user) throw new ApiError(401, "Please sign in.");
        if (opts.auth === "admin" && user.role !== "admin") throw new ApiError(403, "Only administrators can do this.");
      }
      return await fn({ req, params: context?.params ? await context.params : ({} as P), user });
    } catch (err) {
      if (err instanceof ApiError) return fail(err.status, err.message, err.fields);
      const code = (err as { code?: string }).code;
      if (code === "ECONNREFUSED" || code === "ER_ACCESS_DENIED_ERROR" || code === "ER_BAD_DB_ERROR" || code === "ETIMEDOUT") {
        console.error("[api] database unavailable:", code);
        return fail(503, "The database is not reachable. Check that MySQL is running.");
      }
      if (code === "ER_DUP_ENTRY") return fail(409, "That already exists.");
      console.error("[api]", err);
      return fail(500, "Something went wrong on the server.");
    }
  };
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    const body = await req.json();
    if (body && typeof body === "object") return body as T;
  } catch {}
  throw new ApiError(400, "The request body must be JSON.");
}

export function idParam(raw: string | undefined): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "Invalid id.");
  return id;
}

/** ?page=&pageSize= with sane limits. */
export function pagination(url: URL, defaultSize = 20) {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || defaultSize));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

/** Whitelisted ORDER BY from ?sort=field&dir=asc|desc. */
export function sorting(url: URL, allowed: Record<string, string>, fallback: string) {
  const column = allowed[url.searchParams.get("sort") ?? ""] ?? allowed[fallback];
  const dir = url.searchParams.get("dir") === "asc" ? "ASC" : "DESC";
  return `${column} ${dir}`;
}

/** The public pages read from the database; regenerate them after content changes. */
export function refreshSite() {
  revalidatePath("/", "layout");
}
