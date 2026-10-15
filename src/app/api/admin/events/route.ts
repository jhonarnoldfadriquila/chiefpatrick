import { ok, pagination, readJson, route, sorting } from "@/lib/server/http";
import { createEvent, listEvents } from "@/lib/server/repos/bookings";
import { eventShape } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";

/** ?status=&q=&from=&to=&sort=date|amount|created|name&dir=&page=&pageSize= */
export const GET = route(
  async ({ req }) => {
    const url = new URL(req.url);
    const { page, pageSize, offset } = pagination(url);
    const { items, total } = await listEvents({
      status: url.searchParams.get("status") ?? undefined,
      q: url.searchParams.get("q")?.trim() || undefined,
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
      limit: pageSize,
      offset,
      orderBy: sorting(url, { date: "event_date", amount: "amount", created: "created_at", name: "name" }, "date"),
    });
    return ok(items, { total, page, pageSize });
  },
  { auth: "staff" },
);

export const POST = route(
  async ({ req }) => {
    const d = parse(await readJson(req), eventShape);
    const id = await createEvent({ ...d, date: d.date!, guests: d.guests ?? 0, amount: d.amount ?? 0, notes: d.notes || null });
    return ok({ id }, undefined, 201);
  },
  { auth: "staff" },
);
