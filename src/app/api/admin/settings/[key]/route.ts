import { ApiError, ok, readJson, refreshSite, route } from "@/lib/server/http";
import { getSettings, setSetting } from "@/lib/server/repos/content";
import { settingsShapes } from "@/lib/server/schemas";
import { parse, v } from "@/lib/server/validate";
import type { Branch, SettingsKey } from "@/types/admin";

const KEYS = Object.keys(settingsShapes) as SettingsKey[];

/** Replaces one settings group: restaurant | contact | social | seo | appearance | kiddie. Admins only. */
export const PUT = route<{ key: string }>(
  async ({ req, params }) => {
    const key = params.key as SettingsKey;
    if (!KEYS.includes(key)) throw new ApiError(404, "Unknown settings group.");
    const body = await readJson(req);
    const value = parse(body, settingsShapes[key] as never) as Record<string, unknown>;

    if (key === "contact") {
      // Branches are a list; validate each one.
      const raw = Array.isArray(body.branches) ? body.branches : [];
      if (raw.length === 0 || raw.length > 6) throw new ApiError(422, "Add between one and six branches.", { branches: "Required." });
      value.branches = raw.map((b: Record<string, unknown>, i: number): Branch => {
        const d = parse(b, {
          name: v.string({ max: 80 }),
          role: v.string({ max: 120, optional: true }),
          address: v.string({ max: 200 }),
          mapHref: v.url({ optional: true }),
          since: v.string({ max: 40, optional: true }),
          phones: v.list({ max: 8, itemMax: 40 }),
        });
        return { id: String(b.id || `branch-${i + 1}`).slice(0, 40), ...d };
      });
    }

    await setSetting(key, value as never);
    refreshSite();
    return ok((await getSettings())[key]);
  },
  { auth: "admin" },
);
