import { ok, readJson, refreshSite, route } from "@/lib/server/http";
import { createPackage, listPackages } from "@/lib/server/repos/packages";
import { packageShape } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";

export const GET = route(async () => ok(await listPackages()), { auth: "staff" });

export const POST = route(
  async ({ req }) => {
    const d = parse(await readJson(req), packageShape);
    const id = await createPackage({ ...d, tier: d.tier || "gold", guests: d.guests!, price: d.price!, forWho: d.forWho });
    refreshSite();
    return ok({ id }, undefined, 201);
  },
  { auth: "staff" },
);
