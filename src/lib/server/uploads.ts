// Image uploads from the admin (server-only): validated by size and by the file's actual bytes,
// stored under UPLOAD_DIR (default ./uploads, outside public/) and served by /api/uploads/[name].
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { ApiError } from "@/lib/server/http";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Detects JPEG / PNG / WebP / AVIF from magic bytes; the browser-supplied type is not trusted. */
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ".png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return ".webp";
  if (buf.toString("ascii", 4, 12) === "ftypavif") return ".avif";
  return null;
}

export async function saveImage(file: unknown): Promise<{ src: string }> {
  if (!(file instanceof File) || file.size === 0) throw new ApiError(422, "Choose a photo to upload.", { file: "Required." });
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(413, "That photo is over 8 MB. Please use a smaller one.", { file: "Max 8 MB." });
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) throw new ApiError(415, "Use a JPG, PNG, WebP or AVIF photo.", { file: "Unsupported file type." });
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return { src: `/api/uploads/${name}` };
}

/** Deletes an uploaded file (no-op for the site's own photos in public/). */
export async function deleteUpload(src: string | null | undefined) {
  if (!src?.startsWith("/api/uploads/")) return;
  await fs.rm(path.join(UPLOAD_DIR, path.basename(src)), { force: true });
}
