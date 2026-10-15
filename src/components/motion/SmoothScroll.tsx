"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, prefersFullMotion, registerGsap, ScrollTrigger } from "@/lib/motion";

interface MotionContextValue {
  /** True when the full motion layer runs (no reduced-motion preference, or ?motion=full). */
  full: boolean;
  lenis: Lenis | null;
}

const MotionContext = createContext<MotionContextValue>({ full: false, lenis: null });
export const useMotion = () => useContext(MotionContext);

/** Lenis smooth scroll driven by GSAP's ticker, so ScrollTrigger and Lenis share one clock. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<MotionContextValue>({ full: false, lenis: null });
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();
    const full = prefersFullMotion();
    document.documentElement.classList.toggle("reduce-motion", !full);
    if (!full) {
      setValue({ full: false, lenis: null });
      return;
    }

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setValue({ full: true, lenis });

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  // New route: start at the top and let every ScrollTrigger re-measure.
  useEffect(() => {
    value.lenis?.scrollTo(0, { immediate: true, force: true });
    if (!value.lenis) window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname, value.lenis]);

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
