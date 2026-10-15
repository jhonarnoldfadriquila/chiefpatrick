import { ok, pagination, route, sorting } from "@/lib/server/http";
import { listInquiries } from "@/lib/server/repos/bookings";

/** ?status=&q=&from=&to=&sort=created|name|subject&dir=&page=&pageSize= */
export const GET = route(
  async ({ req }) => {
    const url = new URL(req.url);
    const { page, pageSize, offset } = pagination(url);
    const { items, total } = await listInquiries({
      status: url.searchParams.get("status") ?? undefined,
      q: url.searchParams.get("q")?.trim() || undefined,
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
      limit: pageSize,
      offset,
      orderBy: sorting(url, { created: "created_at", name: "name", subject: "subject" }, "created"),
    });
    return ok(items, { total, page, pageSize });
  },
  { auth: "staff" },
);
