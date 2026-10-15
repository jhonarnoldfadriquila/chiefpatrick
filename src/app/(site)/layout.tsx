import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Cursor } from "@/components/motion/Cursor";
import { PageTransition } from "@/components/motion/PageTransition";
import { Preloader } from "@/components/motion/Preloader";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { BookingProvider } from "@/components/providers/BookingProvider";
import { SiteSettingsProvider } from "@/components/providers/SiteSettings";
import { getSettings } from "@/lib/content";

// Public website shell shared by every page. Website Settings from the admin (contact details,
// social links, accent colour, loading screen, grain) are read here and passed down.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const { accentColor, showPreloader, showGrain } = settings.appearance;

  return (
    <SiteSettingsProvider value={settings}>
      <div style={{ "--color-red": accentColor } as React.CSSProperties}>
        <SmoothScroll>
          <PageTransition>
            <BookingProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[300] focus:bg-red focus:px-4 focus:py-2 focus:text-rice"
              >
                Skip to content
              </a>
              <Preloader enabled={showPreloader} />
              <Header />
              <main id="main">{children}</main>
              <Footer />
              <Cursor />
              {showGrain && <div aria-hidden className="grain" />}
            </BookingProvider>
          </PageTransition>
        </SmoothScroll>
      </div>
    </SiteSettingsProvider>
  );
}
