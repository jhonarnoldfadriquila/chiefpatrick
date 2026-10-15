// Business facts, taken from the live site (chefpatrickskitchen.ph, read 2026-10-15).

export const branches = [
  {
    id: "caloocan",
    name: "UE Caloocan",
    role: "Main office, kitchen and halls",
    address: "263 UE Tech St., University Hills Subd., Caloocan City",
    mapHref: "https://maps.google.com/?q=263+UE+Tech+St+University+Hills+Subdivision+Caloocan+City",
    phones: ["8361-0493", "8586-9262", "8293-8657", "0917 315 9262", "0927 257 3129"],
    since: "28 June 2013",
  },
  {
    id: "balut",
    name: "Balut, Tondo",
    role: "Where it started",
    address: "2293 Rodriguez St., Balut, Tondo, Manila",
    mapHref: "https://maps.google.com/?q=2293+Rodriguez+St+Balut+Tondo+Manila",
    phones: ["8522-3425", "8239-1885", "0922 878 0003"],
    since: "2009",
  },
] as const;

/** Turns "0917 315 9262" or "8361-0493" into a dialable tel: link (Metro Manila landlines take 02). */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("09") // taste-skill-ignore: PH mobile prefix, not numbering
    ? `tel:+63${digits.slice(1)}` : `tel:+632${digits}`;
}

export const siteConfig = {
  name: "Chef Patrick's Kitchen",
  short: "CPK",
  tagline: "Serving good food since 2009",
  description:
    "Filipino and Chinese catering, event styling and function halls in Caloocan and Manila. Weddings, debuts, birthdays and company events since 2009.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contact: {
    phone: "0917 315 9262",
    phoneHref: telHref("0917 315 9262"),
    hours: "10:00 AM – 9:30 PM daily",
  },
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/chef.pat.kitchen82/", icon: "facebook" },
    { label: "Instagram", href: "https://www.instagram.com/chefpatrickskitchen/", icon: "instagram" },
  ],
  // `short` and `icon` are used by the knife navbar, where space is tight; the footer uses `label`.
  nav: [
    { label: "Home", short: "Home", href: "/", icon: "home" },
    { label: "About Us", short: "About", href: "/about", icon: "about" },
    { label: "Menu", short: "Menu", href: "/menu", icon: "menu" },
    { label: "Packages", short: "Packages", href: "/catering", icon: "catering" },
    { label: "Events", short: "Events", href: "/events", icon: "events" },
    { label: "Venues", short: "Venues", href: "/venues", icon: "venues" },
    { label: "Gallery", short: "Gallery", href: "/gallery", icon: "gallery" },
    { label: "Contact", short: "Contact", href: "/contact", icon: "contact" },
  ],
} as const;

export type NavIcon = (typeof siteConfig.nav)[number]["icon"];
export type SocialIcon = (typeof siteConfig.socials)[number]["icon"];
