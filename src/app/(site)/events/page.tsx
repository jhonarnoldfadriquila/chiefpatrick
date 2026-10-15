import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Marquee } from "@/components/motion/Marquee";
import { RevealImage } from "@/components/motion/RevealImage";
import { RevealText } from "@/components/motion/RevealText";
import { PageHero } from "@/components/ui/PageHero";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getEventOfferings } from "@/lib/content";
import { eventTypes } from "@/lib/data/home";
import { photos } from "@/lib/data/photos";

export const metadata: Metadata = {
  title: "Events",
  description: "Weddings, debuts, birthdays and company events, catered and styled by Chef Patrick's Kitchen.",
};

export default async function EventsPage() {
  const events = await getEventOfferings();
  return (
    <>
      <PageHero
        label="Events"
        meta="Catered · styled · served"
        title={
          <>
            Every kind of <em className="italic-wonk text-red-glow">party</em>
          </>
        }
        intro="Weddings, debuts, birthdays and company events. Our food, our crew and, if you like, our styling and our halls."
        photo={photos.greenAisle}
      />

      <section aria-label="Occasions" className="border-y border-line bg-ink py-8">
        <Marquee items={eventTypes} className="display text-[clamp(3rem,7vw,7rem)] italic-wonk" />
      </section>

      {events.map((e, i) => (
        <section key={e.id} aria-labelledby={`ev-${e.id}`} className="bg-ink py-20 md:py-32">
          <div className="container-site">
            <SectionLabel index={String(i + 1).padStart(2, "0")} label={e.title} meta="Ask for a menu" />
            <div className="mt-14 grid items-center gap-12 md:grid-cols-12">
              <div className={i % 2 ? "md:order-2 md:col-span-5 md:col-start-8" : "md:col-span-5"}>
                <RevealText as="h2" id={`ev-${e.id}`} className="display text-title">
                  {i % 2 ? <em className="italic-wonk text-red-glow">{e.title}</em> : e.title}
                </RevealText>
                <RevealText as="p" className="mt-8 max-w-md text-xl leading-snug text-muted">
                  {e.description}
                </RevealText>
                <Link href="/contact" className="micro group mt-10 inline-flex items-center gap-2 border-b border-rice pb-1" data-cursor="Book">
                  Plan your {e.title.toLowerCase().replace(/s$/, "")}
                  <ArrowUpRightIcon size={16} weight="light" className="transition-transform duration-500 group-hover:rotate-45" />
                </Link>
              </div>
              <div className={i % 2 ? "md:order-1 md:col-span-6" : "md:col-span-6 md:col-start-7"}>
                <RevealImage photo={photos[e.photo]} sizes="(min-width: 768px) 50vw, 92vw" from={i % 2 ? "left" : "right"} className="aspect-[5/4]" />
              </div>
            </div>
          </div>
        </section>
      ))}

      <section aria-labelledby="styling-title" className="bg-red-deep py-24 md:py-36">
        <div className="container-site grid gap-14 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <SectionLabel index={String(events.length + 1).padStart(2, "0")} label="Styling" meta="The Leaf & Bloom" className="border-rice/25 [&_span]:text-rice" />
            <RevealText as="h2" id="styling-title" className="display mt-12 text-title">
              Dressed for the <em className="italic-wonk">night</em>
            </RevealText>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-rice/85">
              Our in-house partner, The Leaf &amp; Bloom Event Styling, dresses the hall to match the menu: flower ceilings,
              centrepieces, the couple&rsquo;s stage and the table you sit at.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-6 md:col-start-7">
            <RevealImage photo={photos.redHall} sizes="(min-width: 768px) 25vw, 46vw" className="aspect-[3/4]" />
            <RevealImage photo={photos.loveseat} sizes="(min-width: 768px) 25vw, 46vw" from="right" className="mt-16 aspect-[3/4]" />
          </div>
        </div>
      </section>
    </>
  );
}
