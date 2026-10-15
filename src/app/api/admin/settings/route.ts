import { ok, route } from "@/lib/server/http";
import { getSettings } from "@/lib/server/repos/content";

export const GET = route(async () => ok(await getSettings()), { auth: "staff" });
