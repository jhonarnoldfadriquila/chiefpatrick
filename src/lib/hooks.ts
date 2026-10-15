"use client";

import { useEffect } from "react";
import { prefersFullMotion } from "@/lib/motion";

/** Prevents the page behind an open overlay (menu, modal, lightbox) from scrolling. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}

/** Calls handler on key presses while active. */
export function useKeydown(active: boolean, handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    if (!active) return;
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, handler]);
}

export function prefersReducedMotion(): boolean {
  return !prefersFullMotion();
}
