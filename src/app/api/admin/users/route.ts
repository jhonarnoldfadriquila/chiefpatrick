import { ok, readJson, route } from "@/lib/server/http";
import { createUser, listUsers } from "@/lib/server/repos/users";
import { userShape } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";

export const GET = route(async () => ok(await listUsers()), { auth: "admin" });

export const POST = route(
  async ({ req }) => {
    const id = await createUser(parse(await readJson(req), userShape));
    return ok({ id }, undefined, 201);
  },
  { auth: "admin" },
);
