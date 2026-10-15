"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";
import { useMotion } from "@/components/motion/SmoothScroll";
import { Flip, gsap, isDesktop, prefersFullMotion, registerGsap } from "@/lib/motion";
import type { Photo } from "@/lib/data/photos";
import { cn } from "@/lib/format";

// Scattered layout for large screens: [left %, width %, top offset in vh, parallax speed].
const SCATTER: [number, number, number, number][] = [
  [2, 30, 0, -12],
  [40, 22, 14, 8],
  [70, 27, 4, -6],
  [10, 22, 6, 10],
  [38, 32, 0, -10],
  [76, 20, 18, 14],
  [0, 26, 10, -8],
  [33, 22, 2, 12],
  [62, 34, 8, -14],
];

/**
 * (08) A loose collage whose photos drift at different speeds while scrolling. Clicking one opens it
 * full screen with a Flip animation from where it sat; arrows and Escape work in the lightbox.
 */
export function Collage({ items }: { items: Photo[] }) {
  const root = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const { lenis } = useMotion();

  // Parallax drift (desktop, full motion).
  useEffect(() => {
    if (!root.current || !prefersFullMotion() || !isDesktop()) return;
    registerGsap();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -Number(el.dataset.speed) },
          { yPercent: Number(el.dataset.speed), ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const open = (i: number, e: React.MouseEvent<HTMLButtonElement>) => {
    opener.current = e.currentTarget;
    registerGsap();
    const thumb = e.currentTarget.querySelector("[data-flip-id]");
    flipState.current = thumb && prefersFullMotion() ? Flip.getState(thumb) : null;
    setIndex(i);
  };

  // Flip from the thumbnail into the lightbox once it renders.
  useEffect(() => {
    if (index === null) return;
    lenis?.stop();
    closeBtn.current?.focus({ preventScroll: true });
    if (flipState.current && big.current) {
      Flip.from(flipState.current, { targets: big.current, duration: 0.9, ease: "expo.inOut", absolute: true, scale: true });
      flipState.current = null;
    } else if (big.current) {
      gsap.fromTo(big.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
  }, [index, lenis]);

  const close = useCallback(() => {
    const finish = () => {
      setIndex(null);
      lenis?.start();
      opener.current?.focus({ preventScroll: true });
    };
    const thumb = opener.current?.querySelector("[data-flip-id]");
    if (big.current && thumb && prefersFullMotion()) {
      Flip.fit(big.current, thumb, { duration: 0.7, ease: "expo.inOut", scale: true, onComplete: finish });
    } else finish();
  }, [lenis]);

  const go = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, go]);

  const current = index === null ? null : items[index];

  return (
    <>
      <div
        ref={root}
        className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:relative lg:block lg:h-[var(--h)]"
        style={{ "--h": `calc(${Math.ceil(items.length / 3) * 34}vw + 12vw)` } as React.CSSProperties}
      >
        {items.map((p, i) => {
          const [left, width, top, speed] = SCATTER[i % SCATTER.length];
          const row = Math.floor(i / 3);
          return (
            <div
              key={p.src}
              data-speed={speed}
              className="lg:absolute lg:top-[var(--t)] lg:left-[var(--l)] lg:w-[var(--w)]"
              style={{ "--l": `${left}%`, "--w": `${width}%`, "--t": `calc(${row * 34}vw + ${top}vh)` } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={(e) => open(i, e)}
                aria-label={`Open photo: ${p.caption ?? p.alt}`}
                data-cursor="View"
                className={cn("group block w-full text-left", i % 2 ? "aspect-[3/4]" : "aspect-[4/5]")}
              >
                <span data-flip-id={`photo-${i}`} className="relative block size-full overflow-hidden bg-surface">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </span>
                <span className="micro mt-3 hidden text-muted lg:block">
                  ({String(i + 1).padStart(2, "0")}) {p.caption}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {current && index !== null && (
        <div role="dialog" aria-modal="true" aria-label={current.caption ?? "Photo"} className="fixed inset-0 z-[140] bg-ink/95">
          <div ref={big} data-flip-id={`photo-${index}`} className="absolute inset-4 md:inset-x-[10vw] md:inset-y-[8vh]">
            <Image key={current.src} src={current.src} alt={current.alt} fill sizes="80vw" className="object-contain" />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-5 md:p-8">
            <p className="micro text-rice">
              ({String(index + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}) {current.caption}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="grid size-12 place-items-center rounded-full border border-line text-rice hover:bg-rice hover:text-ink">
                <CaretLeftIcon size={20} weight="light" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next photo" className="grid size-12 place-items-center rounded-full border border-line text-rice hover:bg-rice hover:text-ink">
                <CaretRightIcon size={20} weight="light" />
              </button>
            </div>
          </div>
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            className="micro absolute top-5 right-5 inline-flex h-11 items-center gap-2 text-rice md:top-8 md:right-8"
            data-cursor="Close"
          >
            Close <XIcon size={18} weight="light" />
          </button>
        </div>
      )}
    </>
  );
}
