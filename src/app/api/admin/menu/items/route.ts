import { ok, pagination, readJson, refreshSite, route, sorting } from "@/lib/server/http";
import { createItem, listItems } from "@/lib/server/repos/menu";
import { menuItemShape as ITEM_SHAPE } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";


/** ?categoryId=&q=&sort=name|price|sold|created&dir=&page=&pageSize= */
export const GET = route(
  async ({ req }) => {
    const url = new URL(req.url);
    const { page, pageSize, offset } = pagination(url, 50);
    const orderBy = sorting(url, { position: "c.position, i.position", name: "i.name", price: "i.price", sold: "i.sold", created: "i.created_at" }, "position");
    const { items, total } = await listItems({
      categoryId: Number(url.searchParams.get("categoryId")) || undefined,
      q: url.searchParams.get("q")?.trim() || undefined,
      limit: pageSize,
      offset,
      orderBy: url.searchParams.get("sort") ? orderBy : "c.position, i.position, i.id",
    });
    return ok(items, { total, page, pageSize });
  },
  { auth: "staff" },
);

export const POST = route(
  async ({ req }) => {
    const data = parse(await readJson(req), ITEM_SHAPE);
    const id = await createItem({ ...data, categoryId: data.categoryId!, sold: data.sold ?? 0 });
    refreshSite();
    return ok({ id }, undefined, 201);
  },
  { auth: "staff" },
);
