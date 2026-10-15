import { ok, refreshSite, route } from "@/lib/server/http";
import { clearDemoData, demoCounts } from "@/lib/server/repos/content";

/** How many sample (demo) records are in the database. */
export const GET = route(async () => ok(await demoCounts()), { auth: "staff" });

/** Removes every sample record (is_demo = 1). Real content is never touched. */
export const DELETE = route(
  async () => {
    await clearDemoData();
    refreshSite();
    return ok(await demoCounts());
  },
  { auth: "admin" },
);
