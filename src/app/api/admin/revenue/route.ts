import { ok, route } from "@/lib/server/http";
import { revenue } from "@/lib/server/repos/stats";

/** Revenue from confirmed and completed events. ?range=7d|30d|12m */
export const GET = route(
  async ({ req }) => {
    const raw = new URL(req.url).searchParams.get("range");
    const range = raw === "30d" || raw === "12m" ? raw : "7d";
    const points = await revenue(range);
    return ok(points, { range, total: points.reduce((n, p) => n + p.revenue, 0) });
  },
  { auth: "staff" },
);
