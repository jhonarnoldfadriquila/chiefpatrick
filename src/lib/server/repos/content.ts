// Gallery, venues, testimonials and website settings.
import { exec, json, query, queryOne, type Row } from "@/lib/server/mysql";
import { moveRow, nextPosition, setClause, toBool } from "@/lib/server/repos/common";
import type { GalleryRecord, SettingsKey, SiteSettings, TestimonialRecord, VenueAreaRecord, VenueRecord } from "@/types/admin";
import { DEFAULT_SETTINGS } from "@/lib/data/defaults";

// ---------- gallery ----------

const mapPhoto = (r: Row): GalleryRecord => ({
  id: r.id,
  src: r.src,
  width: r.width,
  height: r.height,
  alt: r.alt,
  caption: r.caption,
  position: r.position,
  createdAt: r.created_at,
});

export async function listGallery(): Promise<GalleryRecord[]> {
  return (await query("SELECT * FROM gallery ORDER BY position, id")).map(mapPhoto);
}

export async function getPhoto(id: number) {
  const r = await queryOne("SELECT * FROM gallery WHERE id = ?", [id]);
  return r ? mapPhoto(r) : null;
}

/** New uploads go first. */
export async function createPhoto(d: { src: string; width: number; height: number; alt: string; caption?: string | null }) {
  await exec("UPDATE gallery SET position = position + 1");
  const r = await exec("INSERT INTO gallery (src, width, height, alt, caption, position) VALUES (?, ?, ?, ?, ?, 1)", [d.src, d.width, d.height, d.alt, d.caption || null]);
  return r.insertId;
}

export async function updatePhoto(id: number, d: { alt?: string; caption?: string | null }) {
  const { sql, params } = setClause({ ...d, caption: d.caption === "" ? null : d.caption }, { alt: "alt", caption: "caption" });
  if (sql) await exec(`UPDATE gallery SET ${sql} WHERE id = ?`, [...params, id]);
}

export const deletePhoto = (id: number) => exec("DELETE FROM gallery WHERE id = ?", [id]);
export const movePhoto = (id: number, dir: -1 | 1) => moveRow("gallery", id, dir);

// ---------- venues ----------

const mapVenue = (r: Row): VenueRecord => ({
  id: r.id,
  areaId: r.area_id,
  name: r.name,
  address: r.address,
  min: Number(r.min_guests),
  max: Number(r.max_guests),
  position: r.position,
});

export async function listVenues(): Promise<{ ownHalls: VenueRecord[]; areas: VenueAreaRecord[] }> {
  const venues = (await query("SELECT * FROM venues ORDER BY position, id")).map(mapVenue);
  const areas = await query("SELECT * FROM venue_areas ORDER BY position, id");
  return {
    ownHalls: venues.filter((v) => v.areaId === null),
    areas: areas.map((a) => ({ id: a.id, name: a.name, position: a.position, venues: venues.filter((v) => v.areaId === a.id) })),
  };
}

export async function createVenue(d: { areaId: number | null; name: string; address?: string | null; min: number; max: number }) {
  const r = await exec("INSERT INTO venues (area_id, name, address, min_guests, max_guests, position) VALUES (?, ?, ?, ?, ?, ?)", [
    d.areaId, d.name, d.address || null, d.min, d.max, await nextPosition("venues", d.areaId),
  ]);
  return r.insertId;
}

export async function updateVenue(id: number, d: Partial<VenueRecord>) {
  const { sql, params } = setClause({ ...d, address: d.address === "" ? null : d.address }, { name: "name", address: "address", min: "min_guests", max: "max_guests" });
  if (sql) await exec(`UPDATE venues SET ${sql} WHERE id = ?`, [...params, id]);
}

export const deleteVenue = (id: number) => exec("DELETE FROM venues WHERE id = ?", [id]);

export async function createArea(name: string) {
  return (await exec("INSERT INTO venue_areas (name, position) VALUES (?, ?)", [name, await nextPosition("venue_areas")])).insertId;
}
export const renameArea = (id: number, name: string) => exec("UPDATE venue_areas SET name = ? WHERE id = ?", [name, id]);
export const deleteArea = (id: number) => exec("DELETE FROM venue_areas WHERE id = ?", [id]);

// ---------- testimonials ----------

const mapTestimonial = (r: Row): TestimonialRecord => ({
  id: r.id,
  quote: r.quote,
  author: r.author,
  event: r.event,
  published: toBool(r.published),
  isSample: toBool(r.is_sample),
  createdAt: r.created_at,
});

export async function listTestimonials(publishedOnly = false): Promise<TestimonialRecord[]> {
  return (await query(`SELECT * FROM testimonials ${publishedOnly ? "WHERE published = 1" : ""} ORDER BY created_at DESC, id DESC`)).map(mapTestimonial);
}

export async function createTestimonial(d: Omit<TestimonialRecord, "id" | "createdAt">) {
  const r = await exec("INSERT INTO testimonials (quote, author, event, published, is_sample) VALUES (?, ?, ?, ?, ?)", [
    d.quote, d.author, d.event, d.published ? 1 : 0, d.isSample ? 1 : 0,
  ]);
  return r.insertId;
}

export async function updateTestimonial(id: number, d: Partial<TestimonialRecord>) {
  const { sql, params } = setClause(d, { quote: "quote", author: "author", event: "event", published: "published", isSample: "is_sample" });
  if (sql) await exec(`UPDATE testimonials SET ${sql} WHERE id = ?`, [...params, id]);
}

export const deleteTestimonial = (id: number) => exec("DELETE FROM testimonials WHERE id = ?", [id]);

// ---------- settings ----------

export async function getSettings(): Promise<SiteSettings> {
  const rows = await query("SELECT `key`, value FROM settings");
  const out = structuredClone(DEFAULT_SETTINGS) as unknown as Record<string, unknown>;
  for (const r of rows) {
    if (r.key in out) out[r.key] = { ...(out[r.key] as object), ...json<object>(r.value, {}) };
  }
  return out as unknown as SiteSettings;
}

export async function setSetting<K extends SettingsKey>(key: K, value: SiteSettings[K]) {
  await exec("INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", [key, JSON.stringify(value)]);
}

// ---------- demo data ----------

export async function clearDemoData() {
  await exec("DELETE FROM events WHERE is_demo = 1");
  await exec("DELETE FROM reservations WHERE is_demo = 1");
  await exec("DELETE FROM inquiries WHERE is_demo = 1");
  await exec("UPDATE menu_items SET sold = 0, price = NULL, image = NULL, is_demo = 0 WHERE is_demo = 1");
}

export async function demoCounts() {
  const [r] = await query<{ res: number; ev: number; inq: number }>(
    "SELECT (SELECT COUNT(*) FROM reservations WHERE is_demo = 1) AS res, (SELECT COUNT(*) FROM events WHERE is_demo = 1) AS ev, (SELECT COUNT(*) FROM inquiries WHERE is_demo = 1) AS inq",
  );
  return { reservations: Number(r.res), events: Number(r.ev), inquiries: Number(r.inq) };
}
