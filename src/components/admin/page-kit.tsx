"use client";

// Building blocks shared by the management pages.
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { statusLabel } from "@/components/admin/ui";
import { cn } from "@/lib/format";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-adm-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-adm-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusTabs({ options, value, onChange, counts }: { options: string[]; value: string; onChange: (v: string) => void; counts?: Record<string, number> }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg border border-adm-border bg-adm-card p-1">
      {["all", ...options].map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn("relative h-8 shrink-0 rounded-md px-3 text-xs font-medium transition-colors", value === o ? "text-white" : "text-adm-muted hover:text-adm-text")}
        >
          {value === o && <motion.span layoutId={`tabs-${options.join("")}`} className="absolute inset-0 rounded-md bg-adm-red" transition={{ duration: 0.2 }} />}
          <span className="relative">
            {o === "all" ? "All" : statusLabel(o)}
            {counts?.[o] !== undefined && <span className="ml-1.5 opacity-70">{counts[o]}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Search input that reports its value after the user stops typing. */
export function SearchBox({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  useEffect(() => {
    const id = window.setTimeout(() => text !== value && onChange(text), 300);
    return () => window.clearTimeout(id);
  }, [text, value, onChange]);
  return (
    <div className="relative w-full sm:w-64">
      <MagnifyingGlassIcon size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-adm-muted" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-md border border-adm-border bg-adm-card pr-3 pl-9 text-sm text-adm-text placeholder:text-adm-muted/60 outline-none focus:border-adm-red"
      />
    </div>
  );
}

/** Reads ?open=ID / ?edit=ID / ?new=1 once (from dashboard links and search), then clears it. */
export function useDeepLink() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = Number(params.get("open") ?? params.get("edit")) || null;
  const isNew = params.get("new") === "1";
  const clear = () => router.replace(pathname, { scroll: false });
  return { open, isNew, clear };
}

export const th = "px-4 py-2.5 text-left text-[11px] font-medium tracking-wide whitespace-nowrap text-adm-muted uppercase";
export const td = "px-4 py-3 text-[13px] text-adm-text";
