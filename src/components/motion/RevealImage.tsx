"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, prefersFullMotion, registerGsap } from "@/lib/motion";
import type { Photo } from "@/lib/data/photos";
import { cn } from "@/lib/format";

interface RevealImageProps {
  photo: Photo;
  sizes: string;
  className?: string;
  /** Wipe direction of the clip-path reveal. */
  from?: "bottom" | "left" | "right";
  parallax?: boolean;
  priority?: boolean;
  cursor?: string;
}

const START: Record<NonNullable<RevealImageProps["from"]>, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

/**
 * A photograph that wipes open with a clip-path while it settles from 1.2 scale, then drifts
 * slightly inside its frame as the page scrolls. Reduced motion: a plain fade.
 */
export function RevealImage({ photo, sizes, className, from = "bottom", parallax = true, priority, cursor }: RevealImageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const drift = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!frame.current) return;
    registerGsap();
    const ctx = gsap.context(() => {
      if (!prefersFullMotion()) {
        gsap.from(frame.current, { opacity: 0, duration: 0.8, scrollTrigger: { trigger: frame.current, start: "top 90%", once: true } });
        return;
      }
      gsap
        .timeline({ scrollTrigger: { trigger: frame.current, start: "top 85%", once: true } })
        .fromTo(frame.current, { clipPath: START[from] }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" })
        .fromTo(img.current, { scale: 1.2 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
      if (parallax) {
        gsap.fromTo(
          drift.current,
          { yPercent: -6 },
          { yPercent: 6, ease: "none", scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      }
    }, frame);
    return () => ctx.revert();
  }, [from, parallax]);

  return (
    <div ref={frame} className={cn("relative overflow-hidden bg-surface", className)} data-cursor={cursor}>
      <div ref={drift} className="absolute inset-x-0 -top-[8%] -bottom-[8%]">
        <div ref={img} className="relative size-full">
          <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      </div>
    </div>
  );
}
