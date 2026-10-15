import { idParam, ok, readJson, refreshSite, route } from "@/lib/server/http";
import { deleteArea, deleteVenue, renameArea, updateVenue } from "@/lib/server/repos/content";
import { venueShape } from "@/lib/server/schemas";
import { parse, v } from "@/lib/server/validate";

/** ?kind=area targets a venue area instead of a venue. */
export const PATCH = route<{ id: string }>(
  async ({ req, params }) => {
    const id = idParam(params.id);
    const body = await readJson(req);
    if (new URL(req.url).searchParams.get("kind") === "area") await renameArea(id, parse(body, { name: v.string({ max: 100 }) }).name);
    else {
      const d = parse(body, venueShape, true);
      await updateVenue(id, { ...d, min: d.min ?? undefined, max: d.max ?? undefined });
    }
    refreshSite();
    return ok({ id });
  },
  { auth: "staff" },
);

export const DELETE = route<{ id: string }>(
  async ({ req, params }) => {
    const id = idParam(params.id);
    if (new URL(req.url).searchParams.get("kind") === "area") await deleteArea(id);
    else await deleteVenue(id);
    refreshSite();
    return ok({ deleted: true });
  },
  { auth: "admin" },
);
