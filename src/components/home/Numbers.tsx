"use client";

import { useEffect, useRef } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap, prefersFullMotion, registerGsap } from "@/lib/motion";


/** (07) Big numbers on the red field, counting up once as they enter. */
export function Numbers({ stats }: { stats: { value: number; label: string }[] }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current || !prefersFullMotion()) return;
    registerGsap();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const obj = { v: 0 };
        el.textContent = "0";
        gsap.to(obj, {
          v: end,
          duration: 2.2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toLocaleString("en-PH");
          },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-labelledby="numbers-title" className="bg-red py-24 text-rice md:py-36">
      <div className="container-site">
        <SectionLabel index="07" label="In numbers" meta="Since 2009" className="border-rice/30 [&_span]:text-rice [&_p:last-child]:text-rice/70" />
        <h2 id="numbers-title" className="sr-only">
          Chef Patrick&rsquo;s Kitchen in numbers
        </h2>
        <dl className="mt-16 grid gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className="flex flex-col-reverse gap-4 border-rice/30 sm:pr-8 lg:border-l lg:pl-8 lg:first:border-l-0 lg:first:pl-0">
              <dt className="max-w-[16ch] text-lg leading-snug">
                <span className="micro mr-2 text-rice/70">({String(i + 1).padStart(2, "0")})</span>
                {s.label}
              </dt>
              <dd className="display text-[clamp(4.5rem,9vw,9rem)] tabular-nums" data-count={s.value}>
                {s.value.toLocaleString("en-PH")}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
