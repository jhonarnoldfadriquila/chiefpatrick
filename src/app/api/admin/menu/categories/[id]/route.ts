import { idParam, ok, readJson, refreshSite, route } from "@/lib/server/http";
import { deleteCategory, moveCategory, renameCategory } from "@/lib/server/repos/menu";
import { parse, v } from "@/lib/server/validate";

/** { name } renames; { move: -1 | 1 } reorders. */
export const PATCH = route<{ id: string }>(
  async ({ req, params }) => {
    const id = idParam(params.id);
    const body = await readJson(req);
    if (body.move === -1 || body.move === 1) await moveCategory(id, body.move);
    else await renameCategory(id, parse(body, { name: v.string({ max: 80 }) }).name);
    refreshSite();
    return ok({ id });
  },
  { auth: "staff" },
);

export const DELETE = route<{ id: string }>(
  async ({ params }) => {
    await deleteCategory(idParam(params.id));
    refreshSite();
    return ok({ deleted: true });
  },
  { auth: "admin" },
);
