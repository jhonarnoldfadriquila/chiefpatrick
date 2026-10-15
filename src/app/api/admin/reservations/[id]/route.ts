import { ApiError, idParam, ok, readJson, route } from "@/lib/server/http";
import { deleteReservation, getReservation, updateReservation } from "@/lib/server/repos/bookings";
import { reservationShape } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";

export const GET = route<{ id: string }>(
  async ({ params }) => {
    const r = await getReservation(idParam(params.id));
    if (!r) throw new ApiError(404, "Reservation not found.");
    return ok(r);
  },
  { auth: "staff" },
);

export const PATCH = route<{ id: string }>(
  async ({ req, params }) => {
    const id = idParam(params.id);
    if (!(await getReservation(id))) throw new ApiError(404, "Reservation not found.");
    const d = parse(await readJson(req), reservationShape, true);
    await updateReservation(id, { ...d, date: d.date ?? undefined, time: d.time ?? undefined, guests: d.guests ?? undefined });
    return ok(await getReservation(id));
  },
  { auth: "staff" },
);

export const DELETE = route<{ id: string }>(
  async ({ params }) => {
    await deleteReservation(idParam(params.id));
    return ok({ deleted: true });
  },
  { auth: "admin" },
);
