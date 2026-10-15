// Small server-side validator: describe the fields, get typed values back or a 422 with per-field
// messages. Keeps every route's input checking in one consistent shape without a schema library.
import { ApiError } from "@/lib/server/http";

type Rule<T> = (value: unknown, field: string) => T;

const fieldError = (field: string, message: string): never => {
  throw new FieldError(field, message);
};
class FieldError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
  }
}

export const v = {
  string:
    (opts: { min?: number; max?: number; optional?: boolean } = {}): Rule<string> =>
    (value, field) => {
      const s = value == null ? "" : String(value).trim();
      if (!s && opts.optional) return "";
      if (s.length < (opts.min ?? 1)) fieldError(field, opts.min && opts.min > 1 ? `At least ${opts.min} characters.` : "Required.");
      if (opts.max && s.length > opts.max) fieldError(field, `At most ${opts.max} characters.`);
      return s;
    },
  int:
    (opts: { min?: number; max?: number; optional?: boolean } = {}): Rule<number | null> =>
    (value, field) => {
      if ((value === "" || value == null) && opts.optional) return null;
      const n = Number(value);
      if (!Number.isInteger(n)) fieldError(field, "Must be a whole number.");
      if (opts.min != null && n < opts.min) fieldError(field, `Must be at least ${opts.min}.`);
      if (opts.max != null && n > opts.max) fieldError(field, `Must be at most ${opts.max}.`);
      return n;
    },
  money:
    (opts: { optional?: boolean } = {}): Rule<number | null> =>
    (value, field) => {
      if ((value === "" || value == null) && opts.optional) return null;
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0 || n > 100_000_000) fieldError(field, "Enter an amount in pesos.");
      return Math.round(n * 100) / 100;
    },
  bool: (): Rule<boolean> => (value) => value === true || value === 1 || value === "1" || value === "true" || value === "on",
  oneOf:
    <T extends string>(values: readonly T[], opts: { optional?: boolean } = {}): Rule<T> =>
    (value, field) => {
      if ((value === "" || value == null) && opts.optional) return values[0];
      if (!values.includes(value as T)) fieldError(field, "Choose one of the options.");
      return value as T;
    },
  email:
    (opts: { optional?: boolean } = {}): Rule<string> =>
    (value, field) => {
      const s = value == null ? "" : String(value).trim().toLowerCase();
      if (!s && opts.optional) return "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) || s.length > 190) fieldError(field, "Enter a valid email address.");
      return s;
    },
  date:
    (opts: { optional?: boolean } = {}): Rule<string | null> =>
    (value, field) => {
      const s = value == null ? "" : String(value).trim();
      if (!s && opts.optional) return null;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) fieldError(field, "Enter a date (YYYY-MM-DD).");
      return s;
    },
  time:
    (opts: { optional?: boolean } = {}): Rule<string | null> =>
    (value, field) => {
      const s = value == null ? "" : String(value).trim();
      if (!s && opts.optional) return null;
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) fieldError(field, "Enter a time (HH:MM).");
      return s;
    },
  url:
    (opts: { optional?: boolean } = {}): Rule<string> =>
    (value, field) => {
      const s = value == null ? "" : String(value).trim();
      if (!s && opts.optional) return "";
      if (!/^https?:\/\/[^\s]+$/.test(s) || s.length > 300) fieldError(field, "Enter a full link starting with https://");
      return s;
    },
  hexColor: (): Rule<string> => (value, field) => {
    const s = String(value ?? "").trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(s)) fieldError(field, "Use a hex colour like #c8102e.");
    return s.toLowerCase();
  },
  list:
    (opts: { max?: number; itemMax?: number } = {}): Rule<string[]> =>
    (value, field) => {
      const arr = Array.isArray(value) ? value : String(value ?? "").split("\n");
      const items = arr.map((x) => String(x).trim()).filter(Boolean);
      if (opts.max && items.length > opts.max) fieldError(field, `At most ${opts.max} lines.`);
      if (items.some((x) => x.length > (opts.itemMax ?? 200))) fieldError(field, "One of the lines is too long.");
      return items;
    },
};

type Shape = Record<string, Rule<unknown>>;
type Out<S extends Shape> = { [K in keyof S]: ReturnType<S[K]> };

/** Validates `input` against `shape`. With `partial`, only the fields present are checked (PATCH). */
export function parse<S extends Shape>(input: Record<string, unknown>, shape: S, partial = false): Out<S> {
  const out: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const [key, rule] of Object.entries(shape)) {
    if (partial && !(key in input)) continue;
    try {
      out[key] = rule(input[key], key);
    } catch (e) {
      if (e instanceof FieldError) errors[key] = e.message;
      else throw e;
    }
  }
  if (Object.keys(errors).length) throw new ApiError(422, "Please check the highlighted fields.", errors);
  return out as Out<S>;
}
