"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpIcon, ArrowUpRightIcon, FacebookLogoIcon, GlobeIcon, InstagramLogoIcon, TiktokLogoIcon, YoutubeLogoIcon, type Icon } from "@phosphor-icons/react";
import { socialLinks, useSiteSettings } from "@/components/providers/SiteSettings";
import { Magnetic } from "@/components/motion/Magnetic";
import { RevealText } from "@/components/motion/RevealText";
import { useMotion } from "@/components/motion/SmoothScroll";
import { gsap, prefersFullMotion, registerGsap } from "@/lib/motion";
import { siteConfig, telHref } from "@/lib/data/site";

const SOCIAL_ICON: Record<string, Icon> = { Facebook: FacebookLogoIcon, Instagram: InstagramLogoIcon, TikTok: TiktokLogoIcon, YouTube: YoutubeLogoIcon };

/** Live local time in Manila, for the footer meta. */
function ManilaTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time || "--:--:--"}</span>;
}

export function Footer() {
  const { lenis } = useMotion();
  const settings = useSiteSettings();
  const branches = settings.contact.branches;
  const word = useRef<HTMLParagraphElement>(null);
  const year = new Date().getFullYear();

  // The giant wordmark rises from below the edge as the visitor reaches the end of the page.
  useEffect(() => {
    if (!word.current || !prefersFullMotion()) return;
    registerGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        word.current!.querySelectorAll("span"),
        { yPercent: 100 },
        { yPercent: 0, ease: "none", stagger: 0.04, scrollTrigger: { trigger: word.current, start: "top bottom", end: "bottom bottom", scrub: 0.6 } },
      );
    });
    return () => ctx.revert();
  }, []);

  const toTop = () => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" }));

  return (
    <footer className="relative overflow-hidden bg-charcoal">
      {/* (10) CTA */}
      <section aria-labelledby="cta-title" className="container-site border-b border-line pt-32 pb-24 md:pt-44 md:pb-32">
        <p className="micro text-muted">(Reserve) — Caloocan · Tondo</p>
        <RevealText as="h2" id="cta-title" className="display mt-8 max-w-[14ch] text-mega">
          Let&rsquo;s plan your <em className="italic-wonk text-red-glow">celebration</em>
        </RevealText>
        <div className="mt-14 flex flex-wrap items-center gap-8">
          <Magnetic strength={0.45}>
            <Link
              href="/contact"
              data-cursor="Book"
              className="group inline-flex size-40 flex-col items-center justify-center gap-2 rounded-full bg-red text-center text-rice transition-colors duration-500 hover:bg-red-glow md:size-48"
            >
              <ArrowUpRightIcon size={26} weight="light" className="transition-transform duration-500 group-hover:rotate-45" />
              <span className="micro">Reserve your date</span>
            </Link>
          </Magnetic>
          <p className="max-w-sm text-muted">
            Tell us the date, the guest count and the dishes you love. We reply with a menu and a quote within a day.
          </p>
        </div>
      </section>

      {/* Contacts */}
      <div className="container-site grid gap-12 py-16 md:grid-cols-12 md:gap-8">
        {branches.map((b) => (
          <div key={b.id} className="md:col-span-3">
            <p className="micro text-muted">{b.name}</p>
            <a href={b.mapHref} target="_blank" rel="noopener noreferrer" className="link-draw mt-3 inline-block">
              {b.address}
            </a>
            <ul className="mt-3 space-y-1">
              {b.phones.slice(0, 3).map((ph) => (
                <li key={ph}>
                  <a href={telHref(ph)} className="link-draw tabular-nums">
                    {ph}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <nav aria-label="Footer" className="md:col-span-3">
          <p className="micro text-muted">Index</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
            {siteConfig.nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-draw">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-6 md:col-span-3">
          <div>
            <p className="micro text-muted">Manila time</p>
            <p className="mt-3">
              <ManilaTime /> · {settings.contact.hours}
            </p>
          </div>
          <div className="flex items-center gap-4">
{socialLinks(settings).map((s) => {
              const SocialIcon = SOCIAL_ICON[s.label] ?? GlobeIcon;
              return (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="transition-colors hover:text-red-glow">
                  <SocialIcon size={26} weight="light" />
                </a>
              );
            })}
            <button type="button" onClick={toTop} className="micro ml-auto inline-flex items-center gap-2 md:ml-0" data-cursor="Top">
              Back to top <ArrowUpIcon size={16} weight="light" />
            </button>
          </div>
        </div>
      </div>

      {/* The massive wordmark */}
      <p ref={word} aria-hidden className="display flex justify-between overflow-hidden px-3 pb-2 text-[13.6vw] leading-[0.8] tracking-[-0.06em] text-red select-none">
        {"CHEF PATRICK’S".split("").map((c, i) => (
          <span key={i} className="inline-block">
            {c === " " ? " " : c}
          </span>
        ))}
      </p>
      <div className="container-site flex flex-col gap-2 border-t border-line py-6 text-sm text-muted sm:flex-row sm:justify-between">
        <p>
          &copy; {year} {settings.restaurant.name}. {settings.restaurant.tagline}.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href="https://multiplytalents.com" target="_blank" rel="noopener noreferrer" className="micro transition-colors hover:text-rice">
            Powered by Multiply Talents
          </a>
          <Link href="/admin" className="micro inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 transition-colors hover:border-red hover:text-red">
            Admin <ArrowUpRightIcon size={14} weight="light" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
