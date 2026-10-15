"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersFullMotion, registerGsap, ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/format";

/**
 * An endless line of large type. It drifts on its own and speeds up and skews with the scroll
 * velocity, then eases back. Reduced motion: it stands still.
 */
export function Marquee({ items, className, baseSpeed = 60 }: { items: string[]; className?: string; baseSpeed?: number }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || !prefersFullMotion()) return;
    registerGsap();
    let x = 0;
    let velocity = 0;
    const skewTo = gsap.quickTo(el, "skewX", { duration: 0.5, ease: "power3.out" });
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        velocity = self.getVelocity();
      },
    });
    const tick = (_t: number, delta: number) => {
      const width = el.scrollWidth / 2;
      const boost = Math.min(Math.abs(velocity) / 12, 900);
      const direction = velocity < 0 ? -1 : 1;
      x -= ((baseSpeed + boost) * direction * delta) / 1000;
      if (x <= -width) x += width;
      if (x > 0) x -= width;
      gsap.set(el, { x });
      skewTo(gsap.utils.clamp(-12, 12, -velocity / 220));
      velocity *= 0.92;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, [baseSpeed]);

  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap">
          <span className="px-[0.35em]">{item}</span>
          <span aria-hidden className="px-[0.35em] text-[0.45em] text-red-glow">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn("overflow-hidden", className)}>
      <div ref={track} className="flex w-max will-change-transform">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
