"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, hasFinePointer } from "@/lib/motion";
import { useMotion } from "@/components/motion/SmoothScroll";

/**
 * A rice-coloured dot and a larger ring, blended with `difference` so they read on any ground.
 * Over anything with `data-cursor="View"` (or any link/button) the ring grows and shows the label.
 * Mouse and trackpad only.
 */
export function Cursor() {
  const { full } = useMotion();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => setEnabled(full && hasFinePointer()), [full]);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3.out" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3.out" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const target = (e.target as Element).closest<HTMLElement>("[data-cursor], a, button");
      const text = target?.dataset.cursor ?? "";
      const grow = Boolean(target);
      setLabel(text);
      gsap.to(ring.current, { scale: text ? 2.6 : grow ? 1.6 : 1, duration: 0.45, ease: "expo.out" });
      gsap.to(dot.current, { scale: grow ? 0 : 1, duration: 0.3, ease: "expo.out" });
    };
    const leaveWindow = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 });
    const enterWindow = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.2 });

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leaveWindow);
    document.documentElement.addEventListener("pointerenter", enterWindow);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leaveWindow);
      document.documentElement.removeEventListener("pointerenter", enterWindow);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] mix-blend-difference">
      <div ref={dot} className="absolute top-0 left-0 -mt-1 -ml-1 size-2 rounded-full bg-rice" />
      <div
        ref={ring}
        className="absolute top-0 left-0 -mt-5 -ml-5 grid size-10 place-items-center rounded-full border border-rice"
      >
        <span className="micro text-[5px] tracking-[0.15em] text-rice">{label}</span>
      </div>
    </div>
  );
}
