import { ok, refreshSite, route } from "@/lib/server/http";
import { createPhoto, listGallery } from "@/lib/server/repos/content";
import { saveImage } from "@/lib/server/uploads";
import { parse, v } from "@/lib/server/validate";

export const GET = route(async () => ok(await listGallery()), { auth: "staff" });

/** multipart/form-data: file, alt, caption?, width?, height? */
export const POST = route(
  async ({ req }) => {
    const form = await req.formData();
    const meta = parse(Object.fromEntries([...form.entries()].filter(([, val]) => typeof val === "string")), {
      alt: v.string({ min: 5, max: 200 }),
      caption: v.string({ max: 80, optional: true }),
      width: v.int({ min: 0, max: 20000, optional: true }),
      height: v.int({ min: 0, max: 20000, optional: true }),
    });
    const { src } = await saveImage(form.get("file"));
    const id = await createPhoto({ src, alt: meta.alt, caption: meta.caption || null, width: meta.width || 1200, height: meta.height || 900 });
    refreshSite();
    return ok({ id, src }, undefined, 201);
  },
  { auth: "staff" },
);
