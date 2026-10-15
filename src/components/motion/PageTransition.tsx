"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, prefersFullMotion } from "@/lib/motion";
import { siteConfig } from "@/lib/data/site";
import { useMotion } from "@/components/motion/SmoothScroll";

const titleFor = (path: string) =>
  siteConfig.nav.find((n) => (n.href === "/" ? path === "/" : path.startsWith(n.href)))?.label ?? siteConfig.name;

const TransitionContext = createContext<{ reveal: () => void }>({ reveal: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

/**
 * Red curtain between routes. Clicking an internal link slides the curtain up over the page with
 * the next page's title in the middle, the route changes underneath, then the curtain lifts off
 * the new page (triggered from the route template). Reduced motion: an ordinary navigation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lenis } = useMotion();
  const curtain = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLParagraphElement>(null);
  const covering = useRef(false);

  const reveal = useCallback(() => {
    if (!covering.current || !curtain.current) return;
    covering.current = false;
    gsap
      .timeline()
      .to(title.current, { yPercent: -110, duration: 0.5, ease: "expo.in", delay: 0.15 })
      .to(curtain.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.15")
      .set(curtain.current, { visibility: "hidden" });
    lenis?.start();
  }, [lenis]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same page (hash links, current page)
      if (!prefersFullMotion() || !curtain.current) return;

      e.preventDefault();
      covering.current = true;
      if (title.current) title.current.textContent = titleFor(url.pathname);
      lenis?.stop();
      gsap
        .timeline({ onComplete: () => router.push(url.pathname + url.search + url.hash) })
        .set(curtain.current, { visibility: "visible", yPercent: 100 })
        .set(title.current, { yPercent: 110 })
        .to(curtain.current, { yPercent: 0, duration: 0.75, ease: "expo.inOut" })
        .to(title.current, { yPercent: 0, duration: 0.6, ease: "expo.out" }, "-=0.25");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router, lenis]);

  // Safety net: if the route changed some other way (back button), never leave the curtain down.
  useEffect(() => {
    const id = window.setTimeout(reveal, 900);
    return () => window.clearTimeout(id);
  }, [pathname, reveal]);

  return (
    <TransitionContext.Provider value={{ reveal }}>
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="invisible fixed inset-0 z-[160] grid place-items-center bg-red"
      >
        <div className="overflow-hidden">
          <p ref={title} className="display italic-wonk text-[clamp(3rem,9vw,9rem)] text-rice" />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
