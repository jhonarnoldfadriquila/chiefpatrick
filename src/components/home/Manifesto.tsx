"use client";

import { useEffect, useRef } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap, prefersFullMotion, registerGsap } from "@/lib/motion";

// [text, key word?] — key words are set in red italic.
const COPY: [string, boolean][] = [
  ["Since 2009 we have cooked for the days families", false],
  ["remember:", true],
  ["the", false],
  ["wedding", true],
  ["under a ceiling of flowers, the", false],
  ["debut", true],
  ["with eighteen roses, the year-end party for a whole company. Filipino and Chinese food, a", false],
  ["crew in red,", true],
  ["a hall dressed for the night. From one small restaurant in Balut to our own halls in Caloocan,", false],
  ["every plate still leaves the kitchen hot.", true],
];

/** (02) One paragraph whose words light up from 20% to full as it scrolls through the viewport. */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current || !prefersFullMotion()) return;
    registerGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.2 },
        { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: "[data-manifesto]", start: "top 78%", end: "bottom 45%", scrub: true } },
      );
      gsap.fromTo("[data-glyph]", { yPercent: 12 }, { yPercent: -12, ease: "none", scrollTrigger: { trigger: root.current, scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-label="Manifesto" className="relative overflow-hidden bg-ink py-28 md:py-44">
      <span
        data-glyph
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[-6vw] -translate-y-1/2 font-serif text-[46vw] leading-none text-transparent opacity-[0.07] select-none [-webkit-text-stroke:1.5px_var(--color-red-glow)] md:text-[38vw]"
      >
        宴
      </span>
      <div className="container-site relative">
        <SectionLabel index="02" label="Manifesto" meta="Balut · Caloocan · since 2009" />
        <p data-manifesto className="display mt-14 max-w-[22ch] text-[clamp(2rem,4.6vw,4.75rem)] leading-[1.04] md:mt-20">
          {COPY.flatMap(([text, key], i) =>
            text.split(" ").map((w, j) => (
              <span key={`${i}-${j}`} data-word className={key ? "italic-wonk text-red-glow" : undefined}>
                {w}{" "}
              </span>
            )),
          )}
        </p>
      </div>
    </section>
  );
}
