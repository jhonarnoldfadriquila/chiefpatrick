"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { useMotion } from "@/components/motion/SmoothScroll";
import { RevealText } from "@/components/motion/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap, isDesktop, prefersFullMotion, registerGsap } from "@/lib/motion";
import { photos } from "@/lib/data/photos";
import type { PublicVenues as VenueData } from "@/types";
import { cn } from "@/lib/format";

const HALL_PHOTOS = [photos.redCarpetHall, photos.greenCeilingHall, photos.pinkHall, photos.whiteHall];

/**
 * (06) Venues as a horizontal rail. Full motion on desktop: the section pins and vertical scrolling
 * moves the rail sideways. Everywhere else (phones, reduced motion): a native horizontal row you
 * can swipe, drag with the mouse, scroll with a trackpad or step through with the arrow buttons.
 */
export function VenuesRail({ venues }: { venues: VenueData }) {
  const { ownHalls, partners } = venues;
  const partnerCount = partners.reduce((n, a) => n + a.venues.length, 0);
  const root = useRef<HTMLElement>(null);
  // Pinned element is this inner stage, not the <section> React owns (see Hero for why).
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { lenis } = useMotion();
  const [pinned, setPinned] = useState(false);

  // Decide the mode on the client, and keep it right when the window is resized across 1024px.
  useEffect(() => {
    const decide = () => setPinned(prefersFullMotion() && isDesktop());
    decide();
    const mq = window.matchMedia("(min-width: 1024px)");
    mq.addEventListener("change", decide);
    return () => mq.removeEventListener("change", decide);
  }, []);

  // Pinned mode: vertical scroll drives the rail; dragging sideways scrubs the page.
  useEffect(() => {
    const el = track.current;
    if (!pinned || !root.current || !stage.current || !el) return;
    registerGsap();
    const ctx = gsap.context(() => {
      const distance = () => el.scrollWidth - window.innerWidth;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: stage.current, start: "top top", end: () => `+=${distance()}`, pin: stage.current, scrub: 0.8, invalidateOnRefresh: true },
      });
    }, root);

    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    const down = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startScroll = window.scrollY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const target = startScroll - (e.clientX - startX) * 1.6;
      if (lenis) lenis.scrollTo(target, { immediate: true });
      else window.scrollTo(0, target);
    };
    const up = () => (dragging = false);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      ctx.revert();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [pinned, lenis]);

  // Native mode: drag with the mouse to scroll the row sideways (touch already swipes).
  useEffect(() => {
    const el = track.current;
    if (pinned || !el) return;
    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let moved = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      el.style.scrollSnapType = "";
    };
    // A drag should not count as a click on the link inside the last card.
    const click = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("click", click, true);
    };
  }, [pinned]);

  const step = (dir: number) => {
    const el = track.current;
    const card = el?.querySelector("article");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 20), behavior: prefersFullMotion() ? "smooth" : "auto" });
  };

  return (
    <section ref={root} aria-labelledby="venues-title" className="overflow-hidden bg-charcoal">
      <div ref={stage} className={cn("py-24", pinned && "lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0")}>
      <div className="container-site">
        <SectionLabel index="06" label="Venues" meta={`${ownHalls.length} halls of our own · ${partnerCount} partner venues`} />
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <RevealText as="h2" id="venues-title" className="display text-title">
            Halls to <em className="italic-wonk text-red-glow">gather</em> in
          </RevealText>
          {pinned ? (
            <p className="micro text-muted">Scroll or drag →</p>
          ) : (
            <div className="flex gap-2">
              <button type="button" onClick={() => step(-1)} aria-label="Previous venues" className="grid size-12 place-items-center rounded-full border border-line transition-colors hover:border-rice hover:bg-rice hover:text-ink">
                <ArrowLeftIcon size={20} weight="light" />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next venues" className="grid size-12 place-items-center rounded-full border border-line transition-colors hover:border-rice hover:bg-rice hover:text-ink">
                <ArrowRightIcon size={20} weight="light" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={track}
        data-cursor="Drag"
        tabIndex={pinned ? undefined : 0}
        aria-label={pinned ? undefined : "Venues, scroll sideways"}
        className={cn(
          "mt-12 flex gap-5 px-5 select-none md:px-10 lg:mt-14",
          pinned
            ? "w-max"
            : "cursor-grab snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-color:var(--color-line)_transparent] active:cursor-grabbing",
        )}
      >
        {ownHalls.map((hall, i) => (
          <article key={hall.name} className="w-[78vw] shrink-0 snap-start sm:w-[52vw] lg:w-[34vw]">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={HALL_PHOTOS[i % HALL_PHOTOS.length].src} alt={HALL_PHOTOS[i % HALL_PHOTOS.length].alt} fill sizes="(min-width: 1024px) 34vw, 78vw" className="pointer-events-none object-cover" draggable={false} />
            </div>
            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-4">
              <p className="micro text-muted">({String(i + 1).padStart(2, "0")}) UE Caloocan</p>
              <p className="micro text-rice">Up to {hall.max} guests</p>
            </div>
            <h3 className="display mt-3 text-[clamp(2rem,3.4vw,3.5rem)]">{hall.name}</h3>
          </article>
        ))}

        <article className="flex w-[78vw] shrink-0 snap-start flex-col justify-between bg-red p-7 sm:w-[52vw] lg:w-[30vw] lg:p-10">
          <p className="micro">({String(ownHalls.length + 1).padStart(2, "0")}) Partner venues</p>
          <div>
            <p className="display text-[clamp(5rem,9vw,9rem)]">{partnerCount}</p>
            <p className="mt-2 max-w-xs text-lg leading-snug">
              More venues where we cater, across {partners.map((a) => a.area.split(",")[0].split(" &")[0]).join(", ")}.
            </p>
          </div>
          <Link href="/venues" className="micro group inline-flex items-center gap-2 self-start border-b border-rice pb-1" data-cursor="Open">
            All venues <ArrowUpRightIcon size={16} weight="light" className="transition-transform duration-500 group-hover:rotate-45" />
          </Link>
        </article>
        <div aria-hidden className="w-[6vw] shrink-0" />
      </div>
      </div>
    </section>
  );
}
