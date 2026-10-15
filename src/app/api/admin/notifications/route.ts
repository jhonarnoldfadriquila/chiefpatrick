import { ok, route } from "@/lib/server/http";
import { notifications } from "@/lib/server/repos/stats";

export const GET = route(async () => ok(await notifications()), { auth: "staff" });
