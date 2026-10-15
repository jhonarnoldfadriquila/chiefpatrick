import type { ReservationErrors } from "@/lib/validation/reservation";
import type { ReservationInput } from "@/types";

export type SubmitReservationResult =
  | { ok: true; persisted: boolean; reservation: ReservationInput }
  | { ok: false; error: string; errors?: ReservationErrors };

type ApiBody =
  | { ok: true; data: { persisted: boolean; reservation: ReservationInput } }
  | { ok: false; error: string; fields?: ReservationErrors };

/** Client-side call to /api/reservations (saved to the database for the admin). */
export async function submitReservation(input: ReservationInput): Promise<SubmitReservationResult> {
  try {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = (await res.json().catch(() => null)) as ApiBody | null;
    if (!body) return { ok: false, error: `Unexpected server response (${res.status}).` };
    if (body.ok) return { ok: true, ...body.data };
    return { ok: false, error: body.error, errors: body.fields };
  } catch {
    return { ok: false, error: "We couldn't reach the server. Please check your connection and try again." };
  }
}

/** Client-side call to /api/inquiries (the "ask a question" form). */
export async function submitInquiry(input: { name: string; email: string; phone?: string; subject: string; message: string; website?: string }) {
  try {
    const res = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const body = (await res.json().catch(() => null)) as { ok: boolean; error?: string; fields?: Record<string, string> } | null;
    if (!body) return { ok: false as const, error: `Unexpected server response (${res.status}).` };
    return body.ok ? { ok: true as const } : { ok: false as const, error: body.error ?? "Something went wrong.", fields: body.fields };
  } catch {
    return { ok: false as const, error: "We couldn't reach the server. Please check your connection and try again." };
  }
}
