import { ok, readJson, refreshSite, route } from "@/lib/server/http";
import { createCategory, listCategories } from "@/lib/server/repos/menu";
import { parse, v } from "@/lib/server/validate";

export const GET = route(async () => ok(await listCategories()), { auth: "staff" });

export const POST = route(
  async ({ req }) => {
    const { name } = parse(await readJson(req), { name: v.string({ max: 80 }) });
    const id = await createCategory(name);
    refreshSite();
    return ok({ id }, undefined, 201);
  },
  { auth: "staff" },
);
