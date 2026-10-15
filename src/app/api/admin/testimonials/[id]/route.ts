import { idParam, ok, readJson, refreshSite, route } from "@/lib/server/http";
import { deleteTestimonial, updateTestimonial } from "@/lib/server/repos/content";
import { testimonialShape } from "@/lib/server/schemas";
import { parse } from "@/lib/server/validate";

export const PATCH = route<{ id: string }>(
  async ({ req, params }) => {
    const id = idParam(params.id);
    await updateTestimonial(id, parse(await readJson(req), testimonialShape, true));
    refreshSite();
    return ok({ id });
  },
  { auth: "staff" },
);

export const DELETE = route<{ id: string }>(
  async ({ params }) => {
    await deleteTestimonial(idParam(params.id));
    refreshSite();
    return ok({ deleted: true });
  },
  { auth: "staff" },
);
