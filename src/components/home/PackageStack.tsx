"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRightIcon, CheckIcon } from "@phosphor-icons/react";
import { useBooking } from "@/components/providers/BookingProvider";
import { Magnetic } from "@/components/motion/Magnetic";
import { RevealText } from "@/components/motion/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap, prefersFullMotion, registerGsap } from "@/lib/motion";
import { cn, formatPeso } from "@/lib/format";
import type { CateringPackage } from "@/types";

/**
 * (05) Package cards that stick and stack: each one shrinks back and dims a little as the next
 * slides over it. The middle tier is the red one.
 */
export function PackageStack({ packages, index = "05" }: { packages: CateringPackage[]; index?: string }) {
  const { requestBooking } = useBooking();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current || !prefersFullMotion()) return;
    registerGsap();
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card.querySelector("[data-card-inner]"), {
          scale: 0.9,
          opacity: 0.5,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top 14%", scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-labelledby="packages-title" className="bg-ink pt-28 pb-16 md:pt-40">
      <div className="container-site">
        <SectionLabel index={index} label="Packages" meta="Buffet · crew · styling" />
        <RevealText as="h2" id="packages-title" className="display mt-14 text-title">
          Choose a <em className="italic-wonk">package</em>
        </RevealText>
      </div>

      <div className="container-site mt-16 space-y-[8vh]">
        {packages.map((pkg, i) => {
          const red = pkg.popular;
          return (
            <article key={pkg.id} data-card className="sticky top-[12vh]">
              <div
                data-card-inner
                className={cn(
                  "grid min-h-[76vh] origin-top gap-10 p-6 will-change-transform sm:p-10 lg:grid-cols-12 lg:p-14",
                  red ? "bg-red text-rice" : "border border-line bg-charcoal",
                )}
              >
                <div className="flex flex-col justify-between gap-10 lg:col-span-7">
                  <div>
                    <p className={cn("micro", red ? "text-rice/80" : "text-muted")}>
                      ({String(i + 1).padStart(2, "0")}) {red ? "Most chosen" : `For ${pkg.guests} guests`}
                    </p>
                    <h3 className="display mt-6 text-[clamp(4rem,11vw,11rem)]">
                      {red ? <em className="italic-wonk">{pkg.name}</em> : pkg.name}
                    </h3>
                    <p className="mt-6 max-w-md text-lg leading-snug">{pkg.forWho}</p>
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-6">
                    <p>
                      <span className={cn("micro block", red ? "text-rice/80" : "text-muted")}>From · {pkg.guests} guests</span>
                      <span className="display mt-2 block text-[clamp(3rem,6vw,5.5rem)] tabular-nums">{formatPeso(pkg.price)}</span>
                    </p>
                    <Magnetic>
                      <button
                        type="button"
                        data-cursor="Book"
                        onClick={() =>
                          requestBooking({ eventType: "catering", message: `I'm interested in the ${pkg.name} package for about ${pkg.guests} guests.` })
                        }
                        className={cn(
                          "micro group inline-flex h-14 items-center gap-3 rounded-full px-7 transition-colors duration-500",
                          red ? "bg-rice text-ink hover:bg-ink hover:text-rice" : "bg-red text-rice hover:bg-red-glow",
                        )}
                      >
                        Ask about {pkg.name}
                        <ArrowUpRightIcon size={18} weight="light" className="transition-transform duration-500 group-hover:rotate-45" />
                      </button>
                    </Magnetic>
                  </div>
                </div>

                <div className={cn("grid content-start gap-10 lg:col-span-4 lg:col-start-9", red ? "" : "")}>
                  <div>
                    <p className={cn("micro border-b pb-3", red ? "border-rice/30" : "border-line text-muted")}>Included</p>
                    <ul className="mt-4 space-y-2.5">
                      {pkg.inclusions.map((x) => (
                        <li key={x} className="flex gap-3">
                          <CheckIcon size={18} weight="light" className={cn("mt-1 shrink-0", red ? "text-rice" : "text-red-glow")} />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className={cn("micro border-b pb-3", red ? "border-rice/30" : "border-line text-muted")}>On a sample menu</p>
                    <p className="mt-4 font-serif text-xl leading-snug italic">{pkg.sampleMenu.join(" · ")}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        <p className="pt-6 text-sm text-muted">Rates are a guide; your quote depends on the menu, the venue and the date.</p>
      </div>
    </section>
  );
}
