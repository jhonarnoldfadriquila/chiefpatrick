import { ApiError, idParam, ok, readJson, refreshSite, route } from "@/lib/server/http";
import { deletePhoto, getPhoto, movePhoto, updatePhoto } from "@/lib/server/repos/content";
import { deleteUpload } from "@/lib/server/uploads";
import { parse, v } from "@/lib/server/validate";

/** { alt?, caption? } or { move: -1 | 1 } */
export const PATCH = route<{ id: string }>(
  async ({ req, params }) => {
    const id = idParam(params.id);
    const body = await readJson(req);
    if (body.move === -1 || body.move === 1) await movePhoto(id, body.move);
    else await updatePhoto(id, parse(body, { alt: v.string({ min: 5, max: 200 }), caption: v.string({ max: 80, optional: true }) }, true));
    refreshSite();
    return ok({ id });
  },
  { auth: "staff" },
);

export const DELETE = route<{ id: string }>(
  async ({ params }) => {
    const id = idParam(params.id);
    const photo = await getPhoto(id);
    if (!photo) throw new ApiError(404, "Photo not found.");
    await deletePhoto(id);
    await deleteUpload(photo.src); // the site's original photos in public/ are left alone
    refreshSite();
    return ok({ deleted: true });
  },
  { auth: "staff" },
);
