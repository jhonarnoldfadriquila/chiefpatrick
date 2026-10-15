import { ApiError, idParam, ok, readJson, refreshSite, route } from "@/lib/server/http";
import { deleteItem, getItem, moveItem, updateItem } from "@/lib/server/repos/menu";
import { deleteUpload } from "@/lib/server/uploads";
import { parse } from "@/lib/server/validate";
import { menuItemShape as ITEM_SHAPE } from "@/lib/server/schemas";

export const GET = route<{ id: string }>(
  async ({ params }) => {
    const item = await getItem(idParam(params.id));
    if (!item) throw new ApiError(404, "Menu item not found.");
    return ok(item);
  },
  { auth: "staff" },
);

/** Partial update; { move: -1 | 1 } reorders within the course. */
export const PATCH = route<{ id: string }>(
  async ({ req, params }) => {
    const id = idParam(params.id);
    const body = await readJson(req);
    if (body.move === -1 || body.move === 1) {
      await moveItem(id, body.move);
    } else {
      const before = await getItem(id);
      if (!before) throw new ApiError(404, "Menu item not found.");
      const data = parse(body, ITEM_SHAPE, true);
      await updateItem(id, { ...data, categoryId: data.categoryId ?? undefined, sold: data.sold ?? undefined });
      if (data.image !== undefined && before.image && before.image !== data.image) await deleteUpload(before.image);
    }
    refreshSite();
    return ok({ id });
  },
  { auth: "staff" },
);

export const DELETE = route<{ id: string }>(
  async ({ params }) => {
    const id = idParam(params.id);
    const item = await getItem(id);
    await deleteItem(id);
    await deleteUpload(item?.image);
    refreshSite();
    return ok({ deleted: true });
  },
  { auth: "staff" },
);
