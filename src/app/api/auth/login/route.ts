import { clientIp, login, rateLimit } from "@/lib/server/auth";
import { ApiError, ok, readJson, route } from "@/lib/server/http";
import { parse, v } from "@/lib/server/validate";

export const POST = route(async ({ req }) => {
  const { email, password } = parse(await readJson(req), { email: v.email(), password: v.string({ max: 200 }) });
  const ip = await clientIp();
  if (!rateLimit(`login-ip:${ip}`, 20) || !rateLimit(`login-email:${email}`)) {
    throw new ApiError(429, "Too many sign-in attempts. Wait 15 minutes and try again.");
  }
  const user = await login(email, password);
  if (!user) throw new ApiError(401, "Wrong email or password.");
  return ok(user);
});
