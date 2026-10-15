import { ok, readJson, refreshSite, route } from "@/lib/server/http";
import { createTestimonial, listTestimonials } from "@/lib/server/repos/content";
import { testimonialShape } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";

export const GET = route(async () => ok(await listTestimonials()), { auth: "staff" });

export const POST = route(
  async ({ req }) => {
    const d = parse(await readJson(req), testimonialShape);
    const id = await createTestimonial(d);
    refreshSite();
    return ok({ id }, undefined, 201);
  },
  { auth: "staff" },
);
