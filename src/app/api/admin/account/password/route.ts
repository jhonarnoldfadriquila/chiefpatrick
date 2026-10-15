import { clientIp, rateLimit } from "@/lib/server/auth";
import { ApiError, ok, readJson, route } from "@/lib/server/http";
import { changePassword } from "@/lib/server/repos/users";
import { parse, v } from "@/lib/server/validate";

/** { current, next } — changes the signed-in user's password and signs out their other sessions. */
export const PATCH = route(
  async ({ req, user }) => {
    if (!rateLimit(`pw:${await clientIp()}`, 10)) throw new ApiError(429, "Too many attempts. Try again later.");
    const { current, next } = parse(await readJson(req), { current: v.string({ max: 200 }), next: v.string({ min: 8, max: 200 }) });
    if (!(await changePassword(user!.id, current, next))) throw new ApiError(400, "Your current password is wrong.", { current: "Wrong password." });
    return ok({ changed: true });
  },
  { auth: "staff" },
);
