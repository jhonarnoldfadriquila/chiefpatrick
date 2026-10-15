"use client";

import { useEffect, type ReactNode } from "react";
import { usePageTransition } from "@/components/motion/PageTransition";

// Re-mounts on every navigation: once the new page is in the DOM, lift the red curtain off it.
export default function Template({ children }: { children: ReactNode }) {
  const { reveal } = usePageTransition();
  useEffect(() => {
    const id = requestAnimationFrame(() => reveal());
    return () => cancelAnimationFrame(id);
  }, [reveal]);
  return <>{children}</>;
}
