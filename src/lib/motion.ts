"use client";

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

/** Registers the GSAP plugins once, on the client. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
  gsap.defaults({ ease: "expo.out", duration: 1.1 });
  registered = true;
}

/**
 * Every visitor always gets the full motion layer (a client decision), whatever their system's
 * reduced-motion setting says. A preference saved by an earlier version of the site is cleared.
 */
export function prefersFullMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.removeItem("cpk-motion");
  } catch {}
  return true;
}

/** A mouse or trackpad: the custom cursor, magnetic pull and WebGL hovers only run here. */
export function hasFinePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

export { gsap, ScrollTrigger, SplitText, Flip };
