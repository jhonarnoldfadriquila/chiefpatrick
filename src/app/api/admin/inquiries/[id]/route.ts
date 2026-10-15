import { ApiError, idParam, ok, readJson, route } from "@/lib/server/http";
import { deleteInquiry, getInquiry, updateInquiry } from "@/lib/server/repos/bookings";
import { inquiryUpdateShape } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";

export const GET = route<{ id: string }>(
  async ({ params }) => {
    const i = await getInquiry(idParam(params.id));
    if (!i) throw new ApiError(404, "Inquiry not found.");
    return ok(i);
  },
  { auth: "staff" },
);

/** { status, adminNote } */
export const PATCH = route<{ id: string }>(
  async ({ req, params }) => {
    const id = idParam(params.id);
    if (!(await getInquiry(id))) throw new ApiError(404, "Inquiry not found.");
    const d = parse(await readJson(req), inquiryUpdateShape, true);
    await updateInquiry(id, { status: d.status, adminNote: d.adminNote === undefined ? undefined : d.adminNote || null });
    return ok(await getInquiry(id));
  },
  { auth: "staff" },
);

export const DELETE = route<{ id: string }>(
  async ({ params }) => {
    await deleteInquiry(idParam(params.id));
    return ok({ deleted: true });
  },
  { auth: "admin" },
);
