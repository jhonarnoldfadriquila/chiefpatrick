import { Collage } from "@/components/gallery/Collage";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { MenuSplit } from "@/components/home/MenuSplit";
import { Numbers } from "@/components/home/Numbers";
import { PackageStack } from "@/components/home/PackageStack";
import { Testimonials } from "@/components/home/Testimonials";
import { VenuesRail } from "@/components/home/VenuesRail";
import { Marquee } from "@/components/motion/Marquee";
import { RevealText } from "@/components/motion/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getCateringPackages, getGallery, getMenu, getStats, getTestimonials, getVenues } from "@/lib/content";
import { eventTypes } from "@/lib/data/home";

export default async function HomePage() {
  const [packages, gallery, menu, stats, testimonials, venues] = await Promise.all([
    getCateringPackages(),
    getGallery(),
    getMenu(),
    getStats(),
    getTestimonials(),
    getVenues(),
  ]);
  const collage = gallery.slice(0, 9);
  const dishCount = menu.reduce((n, s) => n + s.items.length, 0);

  return (
    <>
      <Hero />
      <Manifesto />

      {/* (03) Marquee */}
      <section aria-label="Events we cater" className="border-y border-line bg-ink py-8 md:py-12">
        <Marquee items={eventTypes} className="display text-[clamp(3.5rem,9vw,9rem)] italic-wonk" />
      </section>

      <MenuSplit dishCount={dishCount} />
      <PackageStack packages={packages} />
      <VenuesRail venues={venues} />
      <Numbers stats={stats} />

      {/* (08) Gallery */}
      <section aria-labelledby="gallery-title" className="bg-ink py-28 md:py-40">
        <div className="container-site">
          <SectionLabel index="08" label="Gallery" meta="From our events" />
          <RevealText as="h2" id="gallery-title" className="display mt-14 mb-16 text-title md:mb-24">
            Moments, <em className="italic-wonk text-red-glow">served</em>
          </RevealText>
          <Collage items={collage} />
        </div>
      </section>

      <Testimonials testimonials={testimonials} />
    </>
  );
}
