"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap, prefersFullMotion, registerGsap, SplitText } from "@/lib/motion";
import type { PublicTestimonial as TestimonialRecord } from "@/types";

const HOLD_MS = 8000;

/** (09) One huge quote at a time; its characters rise in, the author and event follow. */
export function Testimonials({ testimonials }: { testimonials: TestimonialRecord[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const quote = useRef<HTMLQuoteElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const t = testimonials[index] ?? testimonials[0];

  useEffect(() => {
    if (!quote.current || !t) return;
    registerGsap();
    if (!prefersFullMotion()) {
      gsap.fromTo([quote.current, meta.current], { opacity: 0 }, { opacity: 1, duration: 0.5 });
      return;
    }
    const split = SplitText.create(quote.current, { type: "words,chars", mask: "words" });
    const tl = gsap
      .timeline()
      .from(split.chars, { yPercent: 110, duration: 0.9, stagger: 0.008, ease: "expo.out" })
      .fromTo(meta.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5");
    return () => {
      tl.kill();
      split.revert();
    };
  }, [index]);

  useEffect(() => {
    if (paused || testimonials.length < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % testimonials.length), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, testimonials.length]);

  if (!t) return null;

  const go = (d: number) => setIndex((i) => (i + d + testimonials.length) % testimonials.length);

  return (
    <section
      aria-labelledby="words-title"
      className="bg-ink py-28 md:py-44"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container-site">
        <SectionLabel index="09" label="Kind words" meta={`${String(index + 1).padStart(2, "0")} / ${String(testimonials.length).padStart(2, "0")}`} />
        <h2 id="words-title" className="sr-only">
          What clients say
        </h2>
        <figure className="mt-16 min-h-[22rem] md:mt-24 md:min-h-[26rem]" aria-live="polite">
          <blockquote ref={quote} key={index} className="display max-w-[20ch] text-[clamp(2.25rem,5.6vw,6rem)] leading-[0.98]">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <div ref={meta} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
            <figcaption className="text-lg">{t.author}</figcaption>
            <p className="micro text-muted">{t.event}</p>
            {t.isSample && <p className="micro rounded-full border border-gold px-3 py-1 text-gold">Sample</p>}
          </div>
        </figure>
        <div className="mt-12 flex gap-3">
          <button type="button" onClick={() => go(-1)} aria-label="Previous quote" className="grid size-14 place-items-center rounded-full border border-line transition-colors hover:border-rice hover:bg-rice hover:text-ink">
            <ArrowLeftIcon size={20} weight="light" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next quote" className="grid size-14 place-items-center rounded-full border border-line transition-colors hover:border-rice hover:bg-rice hover:text-ink">
            <ArrowRightIcon size={20} weight="light" />
          </button>
        </div>
      </div>
    </section>
  );
}
