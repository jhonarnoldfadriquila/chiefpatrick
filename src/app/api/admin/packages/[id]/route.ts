import { idParam, ok, readJson, refreshSite, route } from "@/lib/server/http";
import { deletePackage, movePackage, updatePackage } from "@/lib/server/repos/packages";
import { packageShape } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";

export const PATCH = route<{ id: string }>(
  async ({ req, params }) => {
    const id = idParam(params.id);
    const body = await readJson(req);
    if (body.move === -1 || body.move === 1) await movePackage(id, body.move);
    else {
      const d = parse(body, packageShape, true);
      await updatePackage(id, { ...d, guests: d.guests ?? undefined, price: d.price ?? undefined });
    }
    refreshSite();
    return ok({ id });
  },
  { auth: "staff" },
);

export const DELETE = route<{ id: string }>(
  async ({ params }) => {
    await deletePackage(idParam(params.id));
    refreshSite();
    return ok({ deleted: true });
  },
  { auth: "admin" },
);
