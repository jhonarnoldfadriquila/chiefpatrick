import { EVENT_TYPES, type EventType, type ReservationInput } from "@/types";

// Shared by the reservation form (client) and /api/reservations (server).

export type ReservationField = keyof ReservationInput;
export type ReservationErrors = Partial<Record<ReservationField, string>>;

export type ReservationFormValues = Record<ReservationField, string>;

export const MAX_GUESTS = 1000;
export const OPENING_TIME = "10:00";
export const CLOSING_TIME = "21:00";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?\d{7,15}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Local calendar date as YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** 30-minute slots between opening and closing time, e.g. ["10:00", "10:30", ...]. */
export function timeSlots(): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = [];
  const [openH] = OPENING_TIME.split(":").map(Number);
  const [closeH] = CLOSING_TIME.split(":").map(Number);
  for (let h = openH; h <= closeH; h++) {
    for (const m of [0, 30]) {
      if (h === closeH && m > 0) break;
      const value = `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      slots.push({ value, label: `${hour12}:${m === 0 ? "00" : "30"} ${h < 12 ? "AM" : "PM"}` });
    }
  }
  return slots;
}

export function validateField(
  field: ReservationField,
  raw: unknown,
  opts: { today?: string } = {},
): string | undefined {
  const value = typeof raw === "string" ? raw.trim() : raw == null ? "" : String(raw);

  switch (field) {
    case "name":
      if (!value) return "Please enter your name.";
      if (value.length < 2) return "Name looks too short.";
      if (value.length > 80) return "Name must be 80 characters or fewer.";
      return;
    case "email":
      if (!value) return "Please enter your email address.";
      if (!EMAIL_RE.test(value)) return "Please enter a valid email address.";
      return;
    case "phone":
      if (!value) return "Please enter your phone number.";
      if (!PHONE_RE.test(value.replace(/[\s()-]/g, ""))) return "Please enter a valid phone number, e.g. 0912 345 6789.";
      return;
    case "date":
      if (!value) return "Please choose a date.";
      if (!DATE_RE.test(value) || Number.isNaN(Date.parse(value))) return "Please choose a valid date.";
      if (opts.today && value < opts.today) return "Please choose today or a future date.";
      return;
    case "time":
      if (!value) return "Please choose a time.";
      if (!TIME_RE.test(value)) return "Please choose a valid time.";
      if (value < OPENING_TIME || value > CLOSING_TIME) return "We accept reservations from 10:00 AM to 9:00 PM.";
      return;
    case "guests": {
      if (!value) return "Please enter the number of guests.";
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1) return "Guests must be a whole number of at least 1.";
      if (n > MAX_GUESTS) return `For more than ${MAX_GUESTS} guests, please call us directly.`;
      return;
    }
    case "eventType":
      if (!value) return "Please select an event type.";
      if (!EVENT_TYPES.some((t) => t.value === value)) return "Please select a valid event type.";
      return;
    case "message":
      if (value.length > 1000) return "Message must be 1,000 characters or fewer.";
      return;
  }
}

const FIELDS: ReservationField[] = ["name", "email", "phone", "date", "time", "guests", "eventType", "message"];

export function validateReservation(
  input: unknown,
  opts: { today?: string } = {},
): { success: true; data: ReservationInput } | { success: false; errors: ReservationErrors } {
  const source = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const errors: ReservationErrors = {};

  for (const field of FIELDS) {
    const error = validateField(field, source[field], opts);
    if (error) errors[field] = error;
  }
  if (Object.keys(errors).length > 0) return { success: false, errors };

  const str = (k: ReservationField) => String(source[k] ?? "").trim();
  const message = str("message");
  return {
    success: true,
    data: {
      name: str("name"),
      email: str("email").toLowerCase(),
      phone: str("phone"),
      date: str("date"),
      time: str("time"),
      guests: Number(str("guests")),
      eventType: str("eventType") as EventType,
      ...(message ? { message } : {}),
    },
  };
}
