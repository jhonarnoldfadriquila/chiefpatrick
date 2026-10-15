"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS } from "@/lib/data/defaults";
import type { SiteSettings } from "@/types/admin";

// Website settings edited in the admin (contact, socials, appearance…), read once per request by
// the site layout and shared with the client components that show them.
const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SiteSettingsProvider({ value, children }: { value: SiteSettings; children: ReactNode }) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext);

/** Social links that are set, in a fixed order. */
export function socialLinks(s: SiteSettings) {
  return [
    { label: "Facebook", href: s.social.facebook },
    { label: "Instagram", href: s.social.instagram },
    { label: "TikTok", href: s.social.tiktok },
    { label: "YouTube", href: s.social.youtube },
  ].filter((x) => x.href);
}
