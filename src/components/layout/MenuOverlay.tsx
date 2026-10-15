"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FacebookLogoIcon, GlobeIcon, InstagramLogoIcon, TiktokLogoIcon, XIcon, YoutubeLogoIcon, type Icon } from "@phosphor-icons/react";
import { socialLinks, useSiteSettings } from "@/components/providers/SiteSettings";
import { gsap, prefersFullMotion } from "@/lib/motion";
import { siteConfig, telHref } from "@/lib/data/site";

const SOCIAL_ICON: Record<string, Icon> = { Facebook: FacebookLogoIcon, Instagram: InstagramLogoIcon, TikTok: TiktokLogoIcon, YouTube: YoutubeLogoIcon };
import { cn } from "@/lib/format";


/** Fullscreen black menu: giant serif links stagger in; hovering one dims the others. */
export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();
  const settings = useSiteSettings();
  const branches = settings.contact.branches;

  // Open / close choreography.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const full = prefersFullMotion();
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement;
      gsap.set(el, { visibility: "visible" });
      const tl = gsap.timeline();
      if (full) {
        tl.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.inOut" })
          .fromTo(el.querySelectorAll("[data-menu-link]"), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.05, ease: "expo.out" }, "-=0.45")
          .fromTo(el.querySelectorAll("[data-menu-meta]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06 }, "-=0.8");
      } else {
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      }
      el.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
      return () => {
        tl.kill();
      };
    }
    if (el.style.visibility === "visible") {
      const tl = gsap.timeline({ onComplete: () => {
          gsap.set(el, { visibility: "hidden" });
        }, });
      if (full) tl.to(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut" });
      else tl.to(el, { opacity: 0, duration: 0.25 });
      returnFocus.current?.focus({ preventScroll: true });
    }
  }, [open]);

  // Escape closes; Tab stays inside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !root.current) return;
      const items = root.current.querySelectorAll<HTMLElement>("a, button");
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={root}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="invisible fixed inset-0 z-[130] overflow-y-auto bg-ink"
    >
      <div className="container-site flex min-h-full flex-col py-6 md:py-8">
        <div className="flex h-12 items-center justify-between md:h-16">
          <p className="micro text-muted" data-menu-meta>
            (Menu)
          </p>
          <button type="button" onClick={onClose} className="micro inline-flex h-11 items-center gap-2 text-rice" data-cursor="Close">
            Close <XIcon size={18} weight="light" />
          </button>
        </div>

        <div className="grid flex-1 gap-12 py-10 lg:grid-cols-12 lg:items-end">
          <nav aria-label="Main" className="lg:col-span-8">
            <ul onPointerLeave={() => setHovered(null)}>
              {siteConfig.nav.map((link, i) => {
                const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <li key={link.href} className="overflow-hidden">
                    <Link
                      href={link.href}
                      data-menu-link
                      onPointerEnter={() => setHovered(link.href)}
                      onFocus={() => setHovered(link.href)}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-baseline gap-4 py-1 transition-colors duration-300 md:gap-6",
                        hovered && hovered !== link.href ? "text-rice/25" : "text-rice",
                      )}
                    >
                      <span className="micro w-10 shrink-0 text-muted">({String(i + 1).padStart(2, "0")})</span>
                      <span className={cn("display text-[clamp(2.75rem,7.5vw,7.5rem)]", active && "italic-wonk text-red-glow")}>
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-10 lg:col-span-4 lg:pb-4">
            {branches.map((b) => (
              <div key={b.id} data-menu-meta>
                <p className="micro text-muted">{b.name}</p>
                <p className="mt-2 text-rice">{b.address}</p>
                <a href={telHref(b.phones[0] ?? "")} className="link-draw mt-1 inline-block text-rice">
                  {b.phones[0] ?? ""}
                </a>
              </div>
            ))}
            <div data-menu-meta className="flex gap-4">
{socialLinks(settings).map((s) => {
              const SocialIcon = SOCIAL_ICON[s.label] ?? GlobeIcon;
              return (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="transition-colors text-rice hover:text-red-glow">
                  <SocialIcon size={28} weight="light" />
                </a>
              );
            })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
