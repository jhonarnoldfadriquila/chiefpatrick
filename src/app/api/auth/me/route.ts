import { ok, route } from "@/lib/server/http";

export const GET = route(async ({ user }) => ok(user), { auth: "staff" });
