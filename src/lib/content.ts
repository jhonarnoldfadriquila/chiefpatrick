// Content access layer for the public site. Everything staff edit in the admin lives in the database;
// these functions read it and fall back to the built-in content in src/lib/data if the database
// can't be reached, so the website keeps working even when the database is down.
import { cateringPackages, eventOfferings } from "@/lib/data/catering";
import { DEFAULT_SETTINGS } from "@/lib/data/defaults";
import { testimonials as fallbackTestimonials } from "@/lib/data/home";
import { kiddieMenu, menuSections, type MenuSection } from "@/lib/data/menu";
import { galleryOrder, photos } from "@/lib/data/photos";
import { ownHalls, partnerVenues } from "@/lib/data/venues";
import { listPackages } from "@/lib/server/repos/packages";
import { menuForSite } from "@/lib/server/repos/menu";
import { getSettings as dbSettings, listGallery, listTestimonials, listVenues } from "@/lib/server/repos/content";
import type { CateringPackage, EventOffering, PublicPhoto, PublicTestimonial, PublicVenues } from "@/types";
import type { SiteSettings } from "@/types/admin";

async function withFallback<T>(read: () => Promise<T>, fallback: () => T, what: string): Promise<T> {
  try {
    return await read();
  } catch (err) {
    console.warn(`[content] ${what}: database unavailable, using built-in content (${(err as { code?: string }).code ?? err})`);
    return fallback();
  }
}

export const getMenu = (): Promise<MenuSection[]> => withFallback(menuForSite, () => menuSections, "menu");

export async function getSettings(): Promise<SiteSettings> {
  return withFallback(dbSettings, () => DEFAULT_SETTINGS, "settings");
}

export async function getKiddie() {
  return (await getSettings()).kiddie ?? { price: kiddieMenu.price, minimum: kiddieMenu.minimum };
}

export const getCateringPackages = (): Promise<CateringPackage[]> =>
  withFallback(
    async () =>
      (await listPackages()).map((p) => ({
        id: String(p.id),
        tier: p.tier as CateringPackage["tier"],
        name: p.name,
        guests: p.guests,
        price: p.price,
        forWho: p.forWho,
        inclusions: p.inclusions,
        sampleMenu: p.sampleMenu,
        popular: p.popular,
      })),
    () => cateringPackages,
    "packages",
  );

export async function getEventOfferings(): Promise<EventOffering[]> {
  return eventOfferings;
}

export const getGallery = (): Promise<PublicPhoto[]> =>
  withFallback(
    async () => (await listGallery()).map((g): PublicPhoto => ({ id: String(g.id), src: g.src, width: g.width, height: g.height, alt: g.alt, caption: g.caption ?? undefined })),
    () => galleryOrder.map((k): PublicPhoto => ({ id: k, ...photos[k] })),
    "gallery",
  );

export const getVenues = (): Promise<PublicVenues> =>
  withFallback(
    async () => {
      const v = await listVenues();
      const strip = (x: { name: string; address: string | null; min: number; max: number }) => ({ name: x.name, ...(x.address ? { address: x.address } : {}), min: x.min, max: x.max });
      return { ownHalls: v.ownHalls.map(strip), partners: v.areas.map((a) => ({ area: a.name, venues: a.venues.map(strip) })) };
    },
    () => ({ ownHalls, partners: partnerVenues }),
    "venues",
  );

/** Published quotes only. */
export const getTestimonials = (): Promise<PublicTestimonial[]> =>
  withFallback(
    async () => (await listTestimonials(true)).map((t) => ({ id: String(t.id), quote: t.quote, author: t.author, event: t.event, isSample: t.isSample })),
    () => fallbackTestimonials.map((t, i) => ({ id: String(i), ...t })),
    "testimonials",
  );

/** Headline numbers, derived from the current content. */
export async function getStats() {
  const [menu, venues] = await Promise.all([getMenu(), getVenues()]);
  const dishes = menu.reduce((n, s) => n + s.items.length, 0);
  const partners = venues.partners.reduce((n, a) => n + a.venues.length, 0);
  const largest = Math.max(0, ...venues.partners.flatMap((a) => a.venues.map((v) => v.max)));
  return [
    { value: new Date().getFullYear() - 2009, label: "Years of cooking, since 2009" },
    { value: dishes, label: "Dishes on the catering menu" },
    { value: partners, label: "Partner venues across Metro Manila" },
    { value: largest, label: "Guests at our largest partner venue" },
  ];
}
