import { ok, route } from "@/lib/server/http";
import { saveImage } from "@/lib/server/uploads";

/** Uploads one image (multipart field "file") and returns its URL, e.g. for a menu item photo. */
export const POST = route(
  async ({ req }) => {
    const form = await req.formData();
    return ok(await saveImage(form.get("file")), undefined, 201);
  },
  { auth: "staff" },
);
