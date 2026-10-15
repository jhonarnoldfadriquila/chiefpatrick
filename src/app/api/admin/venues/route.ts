import { ok, readJson, refreshSite, route } from "@/lib/server/http";
import { createArea, createVenue, listVenues } from "@/lib/server/repos/content";
import { venueShape } from "@/lib/server/schemas";
import { parse, v } from "@/lib/server/validate";

export const GET = route(async () => ok(await listVenues()), { auth: "staff" });

/** { kind: "area", name } adds an area; otherwise adds a venue: { areaId|null, name, address, min, max } */
export const POST = route(
  async ({ req }) => {
    const body = await readJson(req);
    if (body.kind === "area") {
      const id = await createArea(parse(body, { name: v.string({ max: 100 }) }).name);
      refreshSite();
      return ok({ id }, undefined, 201);
    }
    const d = parse(body, venueShape);
    const areaId = body.areaId == null || body.areaId === "" ? null : Number(body.areaId);
    const id = await createVenue({ areaId: Number.isInteger(areaId) ? areaId : null, name: d.name, address: d.address || null, min: d.min!, max: d.max! });
    refreshSite();
    return ok({ id }, undefined, 201);
  },
  { auth: "staff" },
);
