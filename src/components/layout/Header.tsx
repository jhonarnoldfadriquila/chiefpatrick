"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Magnetic } from "@/components/motion/Magnetic";
import { useMotion } from "@/components/motion/SmoothScroll";
import { gsap } from "@/lib/motion";
import { logo } from "@/lib/data/photos";
import { siteConfig } from "@/lib/data/site";

/** Wordmark left, meta in the middle, "Reserve" and "Menu" right. Hides while scrolling down. */
export function Header() {
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { lenis } = useMotion();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let last = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      const down = y > last && y > 160;
      if (down !== hidden && !open) {
        hidden = down;
        gsap.to(bar.current, { yPercent: down ? -120 : 0, duration: 0.6, ease: "expo.out" });
      }
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  return (
    <>
      <header ref={bar} className="fixed inset-x-0 top-0 z-[120]">
        <div className="container-site flex h-20 items-center justify-between gap-6 md:h-24">
          <Link href="/" aria-label={`${siteConfig.name}, home`} className="flex items-center gap-3 text-rice">
            <Image src={logo.src} alt="" width={logo.width} height={logo.height} priority className="h-11 w-auto md:h-12" />
            <span className="hidden font-serif text-xl leading-none tracking-tight sm:block">
              Chef Patrick&rsquo;s
              <span className="block font-sans text-[0.625rem] tracking-[0.35em] uppercase">Kitchen</span>
            </span>
          </Link>

          <p className="micro hidden text-rice lg:block">Caloocan · Tondo — Est. 2009</p>

          <div className="flex items-center gap-2 md:gap-4">
            <Magnetic className="max-sm:hidden">
              <Link href="/contact" className="micro inline-flex h-11 items-center rounded-full border border-rice px-5 text-rice transition-colors hover:bg-rice hover:text-ink">
                Reserve
              </Link>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded={open}
                aria-controls="site-menu"
                className="micro group inline-flex h-11 items-center gap-3 px-2 text-rice"
              >
                Menu
                <span aria-hidden className="flex w-7 flex-col gap-1.5">
                  <span className="h-px w-full bg-rice transition-transform duration-500 group-hover:scale-x-75" />
                  <span className="h-px w-full origin-right bg-rice transition-transform duration-500 group-hover:scale-x-50" />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </header>
      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
