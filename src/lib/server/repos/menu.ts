import { exec, query, queryOne, type Row } from "@/lib/server/db";
import { moveRow, nextPosition, setClause, toBool, toNum } from "@/lib/server/repos/common";
import type { MenuCategory, MenuItemRecord } from "@/types/admin";
import type { MenuSection } from "@/lib/data/menu";

const mapItem = (r: Row): MenuItemRecord => ({
  id: r.id,
  categoryId: r.category_id,
  categoryName: r.category_name ?? undefined,
  name: r.name,
  note: r.note,
  price: toNum(r.price),
  image: r.image,
  sold: Number(r.sold),
  isAvailable: toBool(r.is_available),
  position: r.position,
  createdAt: r.created_at,
});

export async function listCategories(): Promise<MenuCategory[]> {
  const rows = await query(
    "SELECT c.id, c.slug, c.name, c.position, COUNT(i.id) AS item_count FROM menu_categories c LEFT JOIN menu_items i ON i.category_id = c.id GROUP BY c.id ORDER BY c.position, c.id",
  );
  return rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, position: r.position, itemCount: Number(r.item_count) }));
}

export async function createCategory(name: string) {
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "course"}-${Date.now().toString(36)}`;
  const r = await exec("INSERT INTO menu_categories (slug, name, position) VALUES (?, ?, ?)", [slug, name, await nextPosition("menu_categories")]);
  return r.insertId;
}

export const renameCategory = (id: number, name: string) => exec("UPDATE menu_categories SET name = ? WHERE id = ?", [name, id]);
export const deleteCategory = (id: number) => exec("DELETE FROM menu_categories WHERE id = ?", [id]);
export const moveCategory = (id: number, dir: -1 | 1) => moveRow("menu_categories", id, dir);

export async function listItems(opts: { categoryId?: number; q?: string; limit: number; offset: number; orderBy: string }) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.categoryId) {
    where.push("i.category_id = ?");
    params.push(opts.categoryId);
  }
  if (opts.q) {
    where.push("i.name ILIKE ?");
    params.push(`%${opts.q}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await query(
    `SELECT i.*, c.name AS category_name FROM menu_items i JOIN menu_categories c ON c.id = i.category_id ${whereSql} ORDER BY ${opts.orderBy} LIMIT ? OFFSET ?`,
    [...params, opts.limit, opts.offset],
  );
  const [count] = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM menu_items i ${whereSql}`, params);
  return { items: rows.map(mapItem), total: Number(count.n) };
}

export async function getItem(id: number) {
  const r = await queryOne("SELECT i.*, c.name AS category_name FROM menu_items i JOIN menu_categories c ON c.id = i.category_id WHERE i.id = ?", [id]);
  return r ? mapItem(r) : null;
}

const ITEM_COLUMNS = { categoryId: "category_id", name: "name", note: "note", price: "price", image: "image", sold: "sold", isAvailable: "is_available" };

export async function createItem(data: Partial<MenuItemRecord> & { categoryId: number; name: string }) {
  const r = await exec(
    "INSERT INTO menu_items (category_id, name, note, price, image, sold, is_available, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [data.categoryId, data.name, data.note || null, data.price ?? null, data.image || null, data.sold ?? 0, data.isAvailable === false ? 0 : 1, await nextPosition("menu_items", data.categoryId)],
  );
  return r.insertId;
}

export async function updateItem(id: number, data: Partial<MenuItemRecord>) {
  const clean = { ...data, note: data.note === "" ? null : data.note, image: data.image === "" ? null : data.image };
  const { sql, params } = setClause(clean, ITEM_COLUMNS);
  if (sql) await exec(`UPDATE menu_items SET ${sql} WHERE id = ?`, [...params, id]);
}

export const deleteItem = (id: number) => exec("DELETE FROM menu_items WHERE id = ?", [id]);
export const moveItem = (id: number, dir: -1 | 1) => moveRow("menu_items", id, dir);

export async function popularItems(limit = 5) {
  const rows = await query(
    "SELECT i.*, c.name AS category_name FROM menu_items i JOIN menu_categories c ON c.id = i.category_id WHERE i.sold > 0 ORDER BY i.sold DESC, i.name LIMIT ?",
    [limit],
  );
  return rows.map(mapItem);
}

/** The public menu: categories in order, available dishes only. */
export async function menuForSite(): Promise<MenuSection[]> {
  const cats = await query("SELECT id, slug, name FROM menu_categories ORDER BY position, id");
  const items = await query("SELECT category_id, name, note FROM menu_items WHERE is_available = 1 ORDER BY position, id");
  return cats.map((c) => ({
    id: c.slug,
    name: c.name,
    items: items.filter((i) => i.category_id === c.id).map((i) => (i.note ? { name: i.name, note: i.note } : { name: i.name })),
  }));
}
