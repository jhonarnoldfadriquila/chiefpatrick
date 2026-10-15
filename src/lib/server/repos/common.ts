import { exec, query } from "@/lib/server/mysql";

// Tables that have a `position` column, and the column that groups them (if any).
const ORDERED = {
  menu_categories: null,
  menu_items: "category_id",
  packages: null,
  gallery: null,
  venue_areas: null,
  venues: "area_id",
} as const;
export type OrderedTable = keyof typeof ORDERED;

/** Swaps a row with its neighbour above (dir -1) or below (dir 1) within its group. */
export async function moveRow(table: OrderedTable, id: number, dir: -1 | 1) {
  const scope = ORDERED[table];
  const [row] = await query<{ id: number; position: number; scope: number | null }>(
    `SELECT id, position${scope ? `, ${scope} AS scope` : ", NULL AS scope"} FROM ${table} WHERE id = ?`,
    [id],
  );
  if (!row) return;
  const scopeSql = scope ? (row.scope === null ? ` AND ${scope} IS NULL` : ` AND ${scope} = ?`) : "";
  const scopeParams = scope && row.scope !== null ? [row.scope] : [];
  const [neighbour] = await query<{ id: number; position: number }>(
    `SELECT id, position FROM ${table} WHERE ${dir < 0 ? "position < ?" : "position > ?"}${scopeSql} ORDER BY position ${dir < 0 ? "DESC" : "ASC"} LIMIT 1`,
    [row.position, ...scopeParams],
  );
  if (!neighbour) return;
  await exec(`UPDATE ${table} SET position = ? WHERE id = ?`, [neighbour.position, row.id]);
  await exec(`UPDATE ${table} SET position = ? WHERE id = ?`, [row.position, neighbour.id]);
}

/** Next position at the end of a group. */
export async function nextPosition(table: OrderedTable, scopeValue?: number | null): Promise<number> {
  const scope = ORDERED[table];
  const where = scope ? (scopeValue == null ? ` WHERE ${scope} IS NULL` : ` WHERE ${scope} = ?`) : "";
  const [r] = await query<{ p: number | null }>(`SELECT MAX(position) AS p FROM ${table}${where}`, scope && scopeValue != null ? [scopeValue] : []);
  return (r?.p ?? 0) + 1;
}

export const toNum = (v: unknown) => (v == null ? null : Number(v));
export const toBool = (v: unknown) => v === 1 || v === true || v === "1";

/** Builds "col = ?, col2 = ?" and params for the defined keys of `data`, mapped through `columns`. */
export function setClause(data: Record<string, unknown>, columns: Record<string, string>) {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [key, col] of Object.entries(columns)) {
    if (data[key] === undefined) continue;
    sets.push(`${col} = ?`);
    const value = data[key];
    params.push(Array.isArray(value) ? JSON.stringify(value) : typeof value === "boolean" ? Number(value) : value);
  }
  return { sql: sets.join(", "), params };
}
