"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowSquareOutIcon, BellIcon, CaretDownIcon, KeyIcon, ListIcon, MagnifyingGlassIcon, SidebarSimpleIcon, SignOutIcon } from "@phosphor-icons/react";
import { initials } from "@/components/admin/shell/Sidebar";
import { useDismiss } from "@/components/admin/shell/useDismiss";
import { api } from "@/lib/admin/api";
import { cn } from "@/lib/format";
import type { SessionUserLite } from "@/components/admin/shell/AdminShell";

interface Hit {
  type: string;
  id: number;
  title: string;
  subtitle: string;
  href: string;
}
interface Note {
  id: string;
  title: string;
  body: string;
  href: string;
  at: string;
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return <span className="w-44" />;
  return (
    <span className="hidden text-xs whitespace-nowrap text-adm-muted xl:block">
      {now.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} ·{" "}
      {now.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}
    </span>
  );
}

function Search() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    const id = window.setTimeout(async () => {
      try {
        setHits(await api.get<Hit[]>(`/api/admin/search?q=${encodeURIComponent(q.trim())}`));
        setOpen(true);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(id);
  }, [q]);

  return (
    <div ref={box} className="relative w-full max-w-md">
      <MagnifyingGlassIcon size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-adm-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        placeholder="Search here..."
        aria-label="Search menu items, reservations, events and inquiries"
        className="h-9 w-full rounded-md border border-adm-border bg-adm-card pr-3 pl-9 text-sm text-adm-text placeholder:text-adm-muted/70 outline-none focus:border-adm-red"
      />
      <AnimatePresence>
        {open && q.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-adm-border bg-adm-card2 py-1 shadow-xl"
          >
            {loading && hits.length === 0 ? (
              <p className="px-3 py-3 text-sm text-adm-muted">Searching…</p>
            ) : hits.length === 0 ? (
              <p className="px-3 py-3 text-sm text-adm-muted">No results for &ldquo;{q}&rdquo;.</p>
            ) : (
              hits.map((h) => (
                <button
                  key={`${h.type}-${h.id}`}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQ("");
                    router.push(h.href);
                  }}
                  className="block w-full px-3 py-2 text-left hover:bg-adm-card"
                >
                  <span className="block truncate text-sm text-adm-text">{h.title}</span>
                  <span className="block truncate text-xs text-adm-muted capitalize">{h.subtitle}</span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Notifications() {
  const [data, setData] = useState<{ items: Note[]; unread: number }>({ items: [], unread: 0 });
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));

  useEffect(() => {
    const load = () => api.get<{ items: Note[]; unread: number }>("/api/admin/notifications").then(setData).catch(() => {});
    load();
    const id = window.setInterval(load, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${data.unread ? `, ${data.unread} new` : ""}`}
        aria-expanded={open}
        className="relative grid size-9 place-items-center rounded-md text-adm-muted hover:bg-adm-card2 hover:text-adm-text"
      >
        <BellIcon size={20} />
        {data.unread > 0 && (
          <motion.span
            key={data.unread}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-adm-red px-1 text-[10px] leading-4 font-semibold text-white"
          >
            {data.unread > 9 ? "9+" : data.unread}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-adm-border bg-adm-card2 shadow-xl"
          >
            <p className="border-b border-adm-border px-4 py-2.5 text-xs font-semibold text-adm-text">Needs attention</p>
            {data.items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-adm-muted">You&rsquo;re all caught up.</p>
            ) : (
              data.items.map((n) => (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className="block border-b border-adm-border/60 px-4 py-2.5 last:border-0 hover:bg-adm-card">
                  <span className="block truncate text-sm text-adm-text">{n.title}</span>
                  <span className="block truncate text-xs text-adm-muted capitalize">{n.body}</span>
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface HeaderProps {
  user: SessionUserLite;
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
  noLogin?: boolean;
  onLogout: () => void;
  onChangePassword: () => void;
}

export function Header({ user, onToggleSidebar, onOpenMobile, noLogin, onLogout, onChangePassword }: HeaderProps) {
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, menu, () => setMenu(false));

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-adm-border bg-adm-bg/95 px-4 backdrop-blur md:px-6"
    >
      <button type="button" onClick={onOpenMobile} aria-label="Open menu" className="grid size-9 place-items-center rounded-md text-adm-muted hover:bg-adm-card2 hover:text-adm-text lg:hidden">
        <ListIcon size={20} />
      </button>
      <button type="button" onClick={onToggleSidebar} aria-label="Collapse sidebar" className="hidden size-9 place-items-center rounded-md text-adm-muted hover:bg-adm-card2 hover:text-adm-text lg:grid">
        <SidebarSimpleIcon size={20} />
      </button>
      <Search />
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <Notifications />
        <Clock />
        <div ref={box} className="relative">
          <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} className="flex items-center gap-2 rounded-md p-1 hover:bg-adm-card2">
            <span className="grid size-8 place-items-center rounded-full bg-adm-red text-[11px] font-semibold text-white">{initials(user.name)}</span>
            <span className="hidden text-sm text-adm-text sm:block">{user.name}</span>
            <CaretDownIcon size={12} className={cn("hidden text-adm-muted transition-transform sm:block", menu && "rotate-180")} />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-adm-border bg-adm-card2 py-1 shadow-xl"
              >
                <p className="truncate border-b border-adm-border px-3 py-2 text-xs text-adm-muted">{user.email}</p>
                <button type="button" onClick={() => (setMenu(false), onChangePassword())} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-adm-text hover:bg-adm-card">
                  <KeyIcon size={16} /> Change password
                </button>
                {noLogin ? (
                  <Link href="/" target="_blank" className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-adm-text hover:bg-adm-card">
                    <ArrowSquareOutIcon size={16} /> View site
                  </Link>
                ) : (
                  <button type="button" onClick={onLogout} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-adm-red hover:bg-adm-card">
                    <SignOutIcon size={16} /> Log out
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
