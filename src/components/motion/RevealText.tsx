"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, prefersFullMotion, registerGsap, SplitText } from "@/lib/motion";
import { INTRO_EVENT } from "@/components/motion/Preloader";

interface RevealTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** "lines" for headings and paragraphs, "chars" for short quotes and numerals. */
  split?: "lines" | "chars";
  /** "scroll": when it enters the viewport. "intro": right after the preloader. */
  trigger?: "scroll" | "intro";
  delay?: number;
  id?: string;
}

/** Waits for the preloader to finish (or returns at once if it already has). */
export function onIntro(cb: () => void) {
  if ((window as unknown as { __cpkIntro?: boolean }).__cpkIntro) {
    cb();
    return () => {};
  }
  window.addEventListener(INTRO_EVENT, cb, { once: true });
  return () => window.removeEventListener(INTRO_EVENT, cb);
}

/**
 * Splits its text into masked lines (or characters) that slide up into place with a stagger.
 * Under reduced motion it simply fades in. The text is real text in the HTML either way.
 */
export function RevealText({ children, as: Tag = "div", className, split = "lines", trigger = "scroll", delay = 0, id }: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerGsap();
    const full = prefersFullMotion();
    let splitter: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let cancelIntro = () => {};

    const start = (anim: gsap.core.Tween) => {
      if (trigger === "intro") cancelIntro = onIntro(() => anim.play());
    };

    if (!full) {
      tween = gsap.from(el, {
        opacity: 0,
        duration: 0.8,
        ease: "power1.out",
        delay,
        paused: trigger === "intro",
        scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
      });
      start(tween);
    } else {
      gsap.set(el, { opacity: 0 });
      document.fonts.ready.then(() => {
        if (!ref.current) return;
        gsap.set(el, { opacity: 1 });
        splitter = SplitText.create(el, {
          type: split === "chars" ? "lines,words,chars" : "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            const targets = split === "chars" ? self.chars : self.lines;
            tween = gsap.from(targets, {
              yPercent: 115,
              rotate: split === "chars" ? 0 : 2,
              duration: split === "chars" ? 0.9 : 1.3,
              stagger: split === "chars" ? 0.015 : 0.09,
              ease: "expo.out",
              delay,
              paused: trigger === "intro",
              scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
            });
            start(tween);
            return tween;
          },
        });
      });
    }

    return () => {
      cancelIntro();
      tween?.scrollTrigger?.kill();
      tween?.kill();
      splitter?.revert();
    };
  }, [split, trigger, delay]);

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
