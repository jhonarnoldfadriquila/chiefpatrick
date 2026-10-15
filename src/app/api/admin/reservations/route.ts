import { ok, pagination, readJson, route, sorting } from "@/lib/server/http";
import { createReservation, listReservations, updateReservation } from "@/lib/server/repos/bookings";
import { reservationShape } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";

/** ?status=&q=&from=&to=&sort=created|date|guests|name&dir=&page=&pageSize= */
export const GET = route(
  async ({ req }) => {
    const url = new URL(req.url);
    const { page, pageSize, offset } = pagination(url);
    const { items, total } = await listReservations({
      status: url.searchParams.get("status") ?? undefined,
      q: url.searchParams.get("q")?.trim() || undefined,
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
      limit: pageSize,
      offset,
      orderBy: sorting(url, { created: "created_at", date: "event_date", guests: "guests", name: "name" }, "created"),
    });
    return ok(items, { total, page, pageSize });
  },
  { auth: "staff" },
);

/** Staff can also log a reservation taken by phone. */
export const POST = route(
  async ({ req }) => {
    const d = parse(await readJson(req), reservationShape);
    const id = await createReservation({ ...d, date: d.date!, time: d.time!, guests: d.guests! });
    if (d.status !== "pending" || d.notes) await updateReservation(id, { status: d.status, notes: d.notes || null });
    return ok({ id }, undefined, 201);
  },
  { auth: "staff" },
);
