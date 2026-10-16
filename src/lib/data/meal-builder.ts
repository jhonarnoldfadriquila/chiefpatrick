// Meal builder: tray sizes, tray prices and the pricing rules shared by the /meal-builder page and
// /api/meal-builder (the server recomputes every total from these, so a client can't set its own price).
//
// SAMPLE PRICING. chefpatrickskitchen.ph publishes no per-dish or per-tray rates, so the tray prices,
// rush fee and fried-rice surcharge below are placeholders. Confirm with CPK before launch.
import type { MenuSection } from "@/lib/data/menu";
import type { CateringPackage } from "@/types";

export type TraySize = "small" | "medium" | "large";

export const TRAY_SIZES: { id: TraySize; label: string; desc: string; pax: number }[] = [
  { id: "small", label: "Small", desc: "Serves 8–10", pax: 10 },
  { id: "medium", label: "Medium", desc: "Serves 15–20", pax: 20 },
  { id: "large", label: "Large", desc: "Serves 30–35", pax: 35 },
];

/** Tray price per menu course. Courses added later in the admin use DEFAULT_TRAY. */
const TRAY_PRICES: Record<string, Record<TraySize, number>> = {
  soup: { small: 900, medium: 1600, large: 3000 },
  appetizer: { small: 1200, medium: 2200, large: 4200 },
  salad: { small: 1000, medium: 1800, large: 3400 },
  beef: { small: 2200, medium: 4000, large: 7600 },
  chicken: { small: 1500, medium: 2700, large: 5100 },
  pork: { small: 1700, medium: 3100, large: 5900 },
  seafood: { small: 1900, medium: 3500, large: 6600 },
  vegetables: { small: 1100, medium: 2000, large: 3800 },
  noodles: { small: 1200, medium: 2200, large: 4200 },
  rice: { small: 600, medium: 1100, large: 2000 },
  desserts: { small: 1000, medium: 1800, large: 3400 },
};
const DEFAULT_TRAY: Record<TraySize, number> = { small: 1500, medium: 2700, large: 5100 };

export const trayPrices = (sectionId: string) => TRAY_PRICES[sectionId] ?? DEFAULT_TRAY;

/** Per-head charge for dishes the menu marks "+₱25" (the fried rices). */
export function surchargePerHead(note?: string): number {
  const m = note?.match(/\+\s*₱?\s*(\d+)/);
  return m ? Number(m[1]) : 0;
}

/** Orders for a date less than this many days away are rush orders. */
export const LEAD_DAYS = 3;
export const RUSH_FEE = 2000;

/** How many mains and desserts a package includes, read from its inclusions ("5 main dishes", "2 desserts"). */
export function packagePicks(pkg: CateringPackage): { mains: number; desserts: number } {
  const count = (re: RegExp, fallback: number) => {
    for (const line of pkg.inclusions) {
      const m = line.match(re);
      if (m) return Number(m[1]);
    }
    return fallback;
  };
  const tierDefault = { silver: [3, 1], gold: [5, 2], platinum: [7, 3] }[pkg.tier] ?? [4, 1];
  return { mains: count(/(\d+)\s+main/i, tierDefault[0]), desserts: count(/(\d+)\s+desserts?/i, tierDefault[1]) };
}

/** Courses a buffet "main dish" can come from; desserts and rice are chosen separately. */
export const mainSections = (menu: MenuSection[]) => menu.filter((s) => s.id !== "rice" && s.id !== "desserts");
export const section = (menu: MenuSection[], id: string) => menu.find((s) => s.id === id);

// ---------- order lines ----------

export type OrderLine =
  | { kind: "tray"; key: string; sectionId: string; dish: string; size: TraySize; qty: number }
  | { kind: "buffet"; key: string; packageId: string; guests: number; mains: string[]; desserts: string[]; rice: string }
  | { kind: "kiddie"; key: string; set: string; children: number };

export interface Catalog {
  menu: MenuSection[];
  packages: CateringPackage[];
  kiddie: { price: number; minimum: number; sets: string[] };
}

export interface PricedLine {
  title: string;
  details: string[];
  pax: number;
  total: number;
}

const findDish = (menu: MenuSection[], sectionId: string, dish: string) => section(menu, sectionId)?.items.find((i) => i.name === dish);

/** Prices one line against the catalogue, or explains why it isn't valid. */
export function priceLine(line: OrderLine, cat: Catalog): PricedLine | { error: string } {
  if (line.kind === "tray") {
    const dish = findDish(cat.menu, line.sectionId, line.dish);
    const size = TRAY_SIZES.find((s) => s.id === line.size);
    if (!dish || !size) return { error: `${line.dish} is no longer on the menu.` };
    if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > 50) return { error: `Check the quantity for ${line.dish}.` };
    const unit = trayPrices(line.sectionId)[line.size] + surchargePerHead(dish.note) * size.pax;
    return { title: line.dish, details: [`${size.label} tray · ${size.desc.toLowerCase()}`], pax: size.pax * line.qty, total: unit * line.qty };
  }

  if (line.kind === "buffet") {
    const pkg = cat.packages.find((p) => p.id === line.packageId);
    if (!pkg) return { error: "That package is no longer offered." };
    const picks = packagePicks(pkg);
    const mainNames = new Set(mainSections(cat.menu).flatMap((s) => s.items.map((i) => i.name)));
    const dessertNames = new Set(section(cat.menu, "desserts")?.items.map((i) => i.name) ?? []);
    const rice = section(cat.menu, "rice")?.items.find((i) => i.name === line.rice);
    if (!Number.isInteger(line.guests) || line.guests < pkg.guests || line.guests > 1000) return { error: `The ${pkg.name} package starts at ${pkg.guests} guests.` };
    if (line.mains.length !== picks.mains || new Set(line.mains).size !== picks.mains || !line.mains.every((d) => mainNames.has(d)))
      return { error: `Choose ${picks.mains} different main dishes for ${pkg.name}.` };
    if (line.desserts.length !== picks.desserts || new Set(line.desserts).size !== picks.desserts || !line.desserts.every((d) => dessertNames.has(d)))
      return { error: `Choose ${picks.desserts} dessert${picks.desserts === 1 ? "" : "s"} for ${pkg.name}.` };
    if (!rice) return { error: "Choose a rice." };
    const perHead = Math.round(pkg.price / pkg.guests);
    const extra = (line.guests - pkg.guests) * perHead;
    const riceExtra = surchargePerHead(rice.note) * line.guests;
    return {
      title: `${pkg.name} buffet`,
      details: [`${line.guests} guests`, `Mains: ${line.mains.join(", ")}`, `Dessert: ${line.desserts.join(", ")}`, `Rice: ${rice.name}`],
      pax: line.guests,
      total: pkg.price + extra + riceExtra,
    };
  }

  if (line.kind === "kiddie") {
    if (!cat.kiddie.sets.includes(line.set)) return { error: "Choose a kiddie set." };
    if (!Number.isInteger(line.children) || line.children < cat.kiddie.minimum || line.children > 500)
      return { error: `The kiddie menu starts at ${cat.kiddie.minimum} children.` };
    return { title: `Kiddie menu · ${line.set}`, details: [`${line.children} children`], pax: line.children, total: cat.kiddie.price * line.children };
  }

  return { error: "Unknown item." };
}

/** Whole days from today to the event date (both YYYY-MM-DD). */
export function daysUntil(date: string, today: string): number {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

export const isRush = (date: string, today: string) => !!date && daysUntil(date, today) < LEAD_DAYS;

// ---------- checkout ----------

export const OCCASIONS = ["Birthday", "Wedding", "Christening", "Debut", "Anniversary", "House blessing", "Corporate event", "Fiesta", "Other"];

export const THEME_COLOURS = [
  { name: "Red and gold", hex: "#C8102E" },
  { name: "White and gold", hex: "#E8C77A" },
  { name: "Sage green", hex: "#9CAE8F" },
  { name: "Blush pink", hex: "#E8B4B8" },
  { name: "Royal blue", hex: "#2F5AA8" },
  { name: "Burgundy", hex: "#7B2D3B" },
  { name: "Lavender", hex: "#B9A7D6" },
  { name: "Black and white", hex: "#2B2B2B" },
];

export const NEXT_STEPS = [
  "We confirm the date and send your final quote within a day",
  "Once you approve the quote, your date is locked in",
  "We cook everything fresh on the day",
];
