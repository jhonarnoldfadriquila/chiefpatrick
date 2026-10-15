import { clientIp, rateLimit } from "@/lib/server/auth";
import { ApiError, fail, ok, readJson, route } from "@/lib/server/http";
import { createReservation } from "@/lib/server/repos/bookings";
import { validateReservation } from "@/lib/validation/reservation";

/**
 * Public reservation endpoint (the booking form on /contact). Validates server-side, then saves
 * the inquiry with status "pending" so staff see it in the admin.
 */
export const POST = route(async ({ req }) => {
  if (!rateLimit(`reserve:${await clientIp()}`, 10, 60 * 60_000)) {
    throw new ApiError(429, "Too many requests from this connection. Please call us instead.");
  }
  const body = await readJson(req);

  // Allow "yesterday" in UTC so customers in UTC+8 booking for their today aren't rejected.
  const yesterdayUTC = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const result = validateReservation(body, { today: yesterdayUTC });
  if (!result.success) return fail(422, "Please check the highlighted fields.", result.errors as Record<string, string>);

  try {
    await createReservation(result.data);
  } catch (err) {
    console.error("[reservations] could not save", err);
    return fail(503, "We couldn't save your inquiry just now. Please call us instead.");
  }
  return ok({ persisted: true, reservation: result.data });
});
