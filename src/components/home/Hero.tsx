"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { RevealText } from "@/components/motion/RevealText";
import { gsap, isDesktop, prefersFullMotion, registerGsap } from "@/lib/motion";
import { photos } from "@/lib/data/photos";

const SLIDES = [photos.redHall, photos.buffet, photos.floralHall, photos.lanterns, photos.wedding];
const SLIDE_SECONDS = 5;

/**
 * (01) A crossfading sequence of CPK's halls and food, masked in an arch. On desktop the section
 * pins and the arch opens to fill the screen as you scroll; the headline lifts away.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  // The pin goes on this inner stage, never on the <section> React owns: ScrollTrigger wraps a
  // pinned element in a spacer div, and React could not remove a moved <section> on navigation.
  const stage = useRef<HTMLDivElement>(null);
  const arch = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    registerGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(arch.current, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: "expo.out", delay: 0.2 });
      if (!prefersFullMotion() || !isDesktop()) return;
      gsap
        .timeline({ scrollTrigger: { trigger: stage.current, start: "top top", end: "+=130%", scrub: 0.8, pin: stage.current } })
        .fromTo(
          arch.current,
          { clipPath: "inset(14% 33% 10% 33% round 40vw 40vw 0vw 0vw)" },
          { clipPath: "inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)", ease: "power2.inOut" },
        )
        .to(head.current, { yPercent: -35, opacity: 0, ease: "power1.in" }, 0)
        .to(shade.current, { opacity: 0.15, ease: "none" }, 0);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-labelledby="hero-title" className="bg-ink">
      <div ref={stage} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      {/* The arch (phones: a tall arch; desktop: starts small and opens to full screen) */}
      <div
        ref={arch}
        className="absolute inset-0 [clip-path:inset(18%_8%_16%_8%_round_46vw_46vw_0vw_0vw)] lg:[clip-path:inset(14%_33%_10%_33%_round_40vw_40vw_0vw_0vw)]"
      >
        {SLIDES.map((p, i) => (
          <div
            key={p.src}
            className="hero-slide absolute inset-0"
            style={{ animationDelay: `${i * SLIDE_SECONDS}s`, animationDuration: `${SLIDES.length * SLIDE_SECONDS}s` }}
          >
            <Image src={p.src} alt={i === 0 ? p.alt : ""} fill priority={i === 0} sizes="100vw" className="hero-kenburns object-cover" />
          </div>
        ))}
        <div ref={shade} className="absolute inset-0 bg-ink/45" />
      </div>

      {/* Headline */}
      <div ref={head} className="container-site pointer-events-none relative flex h-full flex-col justify-center">
        <RevealText as="h1" id="hero-title" trigger="intro" className="display text-hero text-center">
          Catering a
          <br />
          <em className="italic-wonk text-red-glow">special</em> day
        </RevealText>
      </div>

      {/* Bottom meta row */}
      <div className="container-site absolute inset-x-0 bottom-0 grid grid-cols-3 items-end pb-6 md:pb-8">
        <p className="micro text-rice">Est. 2009</p>
        <p className="micro text-center text-rice">Caloocan · Tondo</p>
        <p className="micro flex items-center justify-end gap-3 text-rice">
          Scroll
          <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-rice/25">
            <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-rice" />
          </span>
        </p>
      </div>
      </div>
    </section>
  );
}
