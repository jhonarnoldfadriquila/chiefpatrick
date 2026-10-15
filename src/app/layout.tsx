import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import { getSettings } from "@/lib/content";
import { siteConfig } from "@/lib/data/site";
import type { SiteSettings } from "@/types/admin";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });

// Title, description and keywords come from Website Settings → SEO in the admin.
export async function generateMetadata(): Promise<Metadata> {
  const { seo, restaurant } = await getSettings();
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: seo.title, template: `%s | ${restaurant.name}` },
    description: seo.description,
    keywords: seo.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    openGraph: {
      type: "website",
      siteName: restaurant.name,
      title: `${restaurant.name} | Catering a special day`,
      description: seo.description,
      locale: "en_PH",
      images: [{ url: "/cpk/chef-patrick-image-2.jpg", width: 975, height: 1200, alt: `A banquet table styled by ${restaurant.name}` }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: "#0a0a0a" };

// LocalBusiness structured data for every branch (from Website Settings → Contact).
function localBusiness(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@graph": settings.contact.branches.map((b) => ({
      "@type": ["FoodEstablishment", "LocalBusiness"],
      name: `${settings.restaurant.name} (${b.name})`,
      servesCuisine: ["Filipino", "Chinese"],
      foundingDate: String(settings.restaurant.founded),
      telephone: b.phones[0],
      url: siteConfig.url,
      image: `${siteConfig.url}/cpk/chef-patricks-kitchen-logo.png`,
      address: { "@type": "PostalAddress", streetAddress: b.address, addressRegion: "Metro Manila", addressCountry: "PH" },
      sameAs: [settings.social.facebook, settings.social.instagram, settings.social.tiktok, settings.social.youtube].filter(Boolean),
    })),
  };
}

// Before first paint: skip the preloader for a tab that has already seen it.
const preloaderScript = `(function(){try{localStorage.removeItem('cpk-motion');if(sessionStorage.getItem('cpk-loaded')==='1')document.documentElement.classList.add('no-preloader');}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="en" className={`${fraunces.variable} ${interTight.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness(settings)).replace(/</g, "\\u003c") }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
