"use client";

// Typed client for the admin REST API. Every call returns the `data` of a successful response or
// throws ApiClientError carrying the server's message and per-field errors.
import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiResult } from "@/types/admin";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export interface Page<T> {
  items: T;
  meta: { total?: number; page?: number; pageSize?: number } & Record<string, unknown>;
}

async function request<T>(method: string, url: string, body?: unknown): Promise<Page<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body instanceof FormData || body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiClientError("Can't reach the server. Check your connection.", 0);
  }
  if (res.status === 401 && typeof window !== "undefined" && !url.startsWith("/api/auth/")) {
    window.location.href = "/admin/login";
  }
  const json = (await res.json().catch(() => null)) as ApiResult<T> | null;
  if (!json) throw new ApiClientError(`Unexpected server response (${res.status}).`, res.status);
  if (!json.ok) throw new ApiClientError(json.error, res.status, json.fields);
  return { items: json.data, meta: json.meta ?? {} };
}

export const api = {
  get: async <T>(url: string) => (await request<T>("GET", url)).items,
  page: <T>(url: string) => request<T>("GET", url),
  post: async <T = { id: number }>(url: string, body?: unknown) => (await request<T>("POST", url, body ?? {})).items,
  patch: async <T = { id: number }>(url: string, body: unknown) => (await request<T>("PATCH", url, body)).items,
  put: async <T = unknown>(url: string, body: unknown) => (await request<T>("PUT", url, body)).items,
  del: async <T = { deleted: boolean }>(url: string) => (await request<T>("DELETE", url)).items,
};

/** Loads `url` (re-fetching when it changes) and exposes loading / error / reload. */
export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<Page<T>["meta"]>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const latest = useRef(0);

  const load = useCallback(async () => {
    if (!url) return;
    const ticket = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const res = await api.page<T>(url);
      if (ticket !== latest.current) return; // a newer request superseded this one
      setData(res.items);
      setMeta(res.meta);
    } catch (e) {
      if (ticket === latest.current) setError((e as Error).message);
    } finally {
      if (ticket === latest.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, meta, error, loading, reload: load, setData };
}

export const peso = (n: number | null | undefined, opts: { compact?: boolean } = {}) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: opts.compact || Number.isInteger(n) ? 0 : 2,
        notation: opts.compact ? "compact" : "standard",
      }).format(n);

export const shortDate = (iso: string | null | undefined) =>
  iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso.replace(" ", "T")).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";

export const time12 = (hhmm: string | null | undefined) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
