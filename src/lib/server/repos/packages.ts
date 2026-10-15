import { exec, json, query, type Row } from "@/lib/server/mysql";
import { moveRow, nextPosition, setClause, toBool } from "@/lib/server/repos/common";
import type { PackageRecord } from "@/types/admin";

const map = (r: Row): PackageRecord => ({
  id: r.id,
  name: r.name,
  tier: r.tier,
  guests: Number(r.guests),
  price: Number(r.price),
  forWho: r.for_who,
  inclusions: json<string[]>(r.inclusions, []),
  sampleMenu: json<string[]>(r.sample_menu, []),
  popular: toBool(r.popular),
  position: r.position,
});

export async function listPackages(): Promise<PackageRecord[]> {
  return (await query("SELECT * FROM packages ORDER BY position, id")).map(map);
}

const COLUMNS = { name: "name", tier: "tier", guests: "guests", price: "price", forWho: "for_who", inclusions: "inclusions", sampleMenu: "sample_menu", popular: "popular" };

export async function createPackage(d: Omit<PackageRecord, "id" | "position">) {
  if (d.popular) await exec("UPDATE packages SET popular = 0");
  const r = await exec(
    "INSERT INTO packages (name, tier, guests, price, for_who, inclusions, sample_menu, popular, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [d.name, d.tier || "gold", d.guests, d.price, d.forWho, JSON.stringify(d.inclusions), JSON.stringify(d.sampleMenu), d.popular ? 1 : 0, await nextPosition("packages")],
  );
  return r.insertId;
}

export async function updatePackage(id: number, d: Partial<PackageRecord>) {
  if (d.popular) await exec("UPDATE packages SET popular = 0 WHERE id <> ?", [id]); // one "most chosen"
  const { sql, params } = setClause(d, COLUMNS);
  if (sql) await exec(`UPDATE packages SET ${sql} WHERE id = ?`, [...params, id]);
}

export const deletePackage = (id: number) => exec("DELETE FROM packages WHERE id = ?", [id]);
export const movePackage = (id: number, dir: -1 | 1) => moveRow("packages", id, dir);
