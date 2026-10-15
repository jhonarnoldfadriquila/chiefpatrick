import { ApiError, idParam, ok, readJson, route } from "@/lib/server/http";
import { deleteEvent, getEvent, updateEvent } from "@/lib/server/repos/bookings";
import { eventShape } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";

export const GET = route<{ id: string }>(
  async ({ params }) => {
    const e = await getEvent(idParam(params.id));
    if (!e) throw new ApiError(404, "Event not found.");
    return ok(e);
  },
  { auth: "staff" },
);

export const PATCH = route<{ id: string }>(
  async ({ req, params }) => {
    const id = idParam(params.id);
    const d = parse(await readJson(req), eventShape, true);
    await updateEvent(id, { ...d, date: d.date ?? undefined, guests: d.guests ?? undefined, amount: d.amount ?? undefined });
    return ok(await getEvent(id));
  },
  { auth: "staff" },
);

export const DELETE = route<{ id: string }>(
  async ({ params }) => {
    await deleteEvent(idParam(params.id));
    return ok({ deleted: true });
  },
  { auth: "staff" },
);
