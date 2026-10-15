"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "framer-motion";
import { CalendarCheckIcon, CalendarIcon, ChatTextIcon, ForkKnifeIcon, PackageIcon, TrendDownIcon, TrendUpIcon, type Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/format";
import type { StatCard } from "@/types/admin";

const ICONS: Record<StatCard["key"], Icon> = {
  menu: ForkKnifeIcon,
  reservations: CalendarIcon,
  packages: PackageIcon,
  events: CalendarCheckIcon,
  inquiries: ChatTextIcon,
};
// Red icon containers for the cards the reference highlights; charcoal for the rest.
const HIGHLIGHT: StatCard["key"][] = ["menu", "events"];

/** Counts from 0 up to `value` the first time it scrolls into view. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (node.textContent = Math.round(v).toLocaleString("en-PH")),
    });
    return () => controls.stop();
  }, [inView, value]);
  return <span ref={ref}>0</span>;
}

export function StatCards({ cards, loading }: { cards: StatCard[] | undefined; loading: boolean }) {
  if (loading && !cards) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-lg border border-adm-border bg-adm-card" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {cards?.map((c, i) => {
        const CardIcon = ICONS[c.key];
        const up = (c.change ?? 0) >= 0;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3 }}
            className={cn("group rounded-lg border border-adm-border bg-adm-card p-4 transition-colors hover:border-adm-red/50", i === 4 && "col-span-2 md:col-span-1")}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-lg transition-colors",
                  HIGHLIGHT.includes(c.key) ? "bg-adm-red text-white" : "bg-adm-card2 text-adm-text group-hover:bg-adm-red/15 group-hover:text-adm-red",
                )}
              >
                <CardIcon size={22} weight="light" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs text-adm-muted">{c.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-adm-text tabular-nums">
                  <CountUp value={c.value} />
                </p>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1 text-[11px] text-adm-muted">
              {c.change === null ? (
                <span>No earlier data to compare</span>
              ) : (
                <>
                  <span className={cn("flex items-center gap-0.5 font-medium", up ? "text-adm-green" : "text-adm-red")}>
                    {up ? <TrendUpIcon size={12} weight="bold" /> : <TrendDownIcon size={12} weight="bold" />}
                    {up ? "+" : ""}
                    {c.change}%
                  </span>
                  vs previous period
                </>
              )}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
