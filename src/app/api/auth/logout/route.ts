import { logout } from "@/lib/server/auth";
import { ok, route } from "@/lib/server/http";

export const POST = route(async () => {
  await logout();
  return ok({ signedOut: true });
});
