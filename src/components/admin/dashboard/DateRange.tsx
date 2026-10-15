"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarBlankIcon, CaretDownIcon } from "@phosphor-icons/react";
import { useDismiss } from "@/components/admin/shell/useDismiss";
import { Button, inputCls } from "@/components/admin/ui";
import { cn } from "@/lib/format";

export interface Range {
  from: string;
  to: string;
  label: string;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};

export const PRESETS: Range[] = [
  { label: "Last 7 days", from: daysAgo(6), to: iso(new Date()) },
  { label: "Last 30 days", from: daysAgo(29), to: iso(new Date()) },
  { label: "Last 90 days", from: daysAgo(89), to: iso(new Date()) },
  { label: "This year", from: `${new Date().getFullYear()}-01-01`, to: iso(new Date()) },
];

const fmt = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

export function DateRange({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState({ from: value.from, to: value.to });
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-md border border-adm-border bg-adm-card px-3 text-sm text-adm-text hover:border-adm-muted/50"
      >
        <CalendarBlankIcon size={16} className="text-adm-muted" />
        <span className="hidden sm:inline">
          {fmt(value.from)} – {fmt(value.to)}
        </span>
        <span className="sm:hidden">{value.label}</span>
        <CaretDownIcon size={12} className={cn("text-adm-muted transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 z-40 mt-2 w-72 rounded-lg border border-adm-border bg-adm-card2 p-2 shadow-xl"
          >
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                className={cn("block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-adm-card", value.label === p.label ? "text-adm-red" : "text-adm-text")}
              >
                {p.label}
              </button>
            ))}
            <div className="mt-2 border-t border-adm-border px-1 pt-3">
              <p className="mb-2 px-2 text-xs text-adm-muted">Custom range</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" aria-label="From" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} className={inputCls} />
                <input type="date" aria-label="To" value={custom.to} min={custom.from} onChange={(e) => setCustom({ ...custom, to: e.target.value })} className={inputCls} />
              </div>
              <Button
                size="sm"
                className="mt-2 w-full"
                disabled={!custom.from || !custom.to || custom.from > custom.to}
                onClick={() => {
                  onChange({ ...custom, label: "Custom" });
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
