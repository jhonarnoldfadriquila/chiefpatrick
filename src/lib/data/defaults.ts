import type { SiteSettings } from "@/types/admin";
import { branches, siteConfig } from "@/lib/data/site";
import { kiddieMenu } from "@/lib/data/menu";

// Website settings used when the database has none yet (or can't be reached). These mirror the
// values seeded into the `settings` table by database/seed.sql.
export const DEFAULT_SETTINGS: SiteSettings = {
  restaurant: { name: siteConfig.name, tagline: siteConfig.tagline, description: siteConfig.description, founded: 2009 },
  contact: {
    hours: siteConfig.contact.hours,
    primaryPhone: siteConfig.contact.phone,
    email: "",
    branches: branches.map((b) => ({ ...b, phones: [...b.phones] })),
  },
  social: {
    facebook: siteConfig.socials[0].href,
    instagram: siteConfig.socials[1].href,
    tiktok: "",
    youtube: "",
  },
  seo: {
    title: `${siteConfig.name} | Filipino & Chinese Catering in Caloocan and Tondo`,
    description: siteConfig.description,
    keywords: "catering Caloocan, catering Tondo, Filipino Chinese catering, function hall Caloocan, wedding catering Manila, debut catering",
  },
  appearance: { accentColor: "#c8102e", showPreloader: true, showGrain: true },
  kiddie: { price: kiddieMenu.price, minimum: kiddieMenu.minimum },
};
