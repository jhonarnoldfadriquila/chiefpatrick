"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersFullMotion } from "@/lib/motion";

export const INTRO_EVENT = "cpk:intro";
const SEEN_KEY = "cpk-loaded";

/** Fires the intro event and remembers it for this tab, so the hero knows it can reveal. */
function finish() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {}
  (window as unknown as { __cpkIntro?: boolean }).__cpkIntro = true;
  window.dispatchEvent(new Event(INTRO_EVENT));
}

/**
 * First visit in a tab: a black screen counts 0 → 100 in big serif numerals, then a red panel wipes
 * up and away. Skipped on later page views and under reduced motion. The overlay is in the server
 * HTML (so nothing flashes before it), and an inline script hides it when it should not run.
 */
export function Preloader({ enabled = true }: { enabled?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    const full = prefersFullMotion();
    const id = requestAnimationFrame(() => {
      if (!enabled || seen || !full || !root.current) {
        setDone(true);
        finish();
        return;
      }
      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          setDone(true);
        },
      });
      tl.to(counter, {
        v: 100,
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: () => {
          if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
        },
      })
        .to(count.current, { yPercent: -110, duration: 0.6, ease: "expo.in" })
        .fromTo(panel.current, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "expo.inOut" }, "-=0.2")
        .set(root.current, { backgroundColor: "transparent" })
        .add(finish)
        .to(panel.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" });
    });
    return () => cancelAnimationFrame(id);
  }, [enabled]);

  if (done || !enabled) return null;
  return (
    <div ref={root} className="preloader fixed inset-0 z-[150] flex items-end justify-between bg-ink p-5 md:p-10" aria-hidden>
      <p className="micro text-muted">Chef Patrick&rsquo;s Kitchen · Est. 2009</p>
      <div className="overflow-hidden">
        <span ref={count} className="display block text-[clamp(6rem,22vw,22rem)] tabular-nums">
          000
        </span>
      </div>
      <div ref={panel} className="absolute inset-0 translate-y-full bg-red" />
    </div>
  );
}
