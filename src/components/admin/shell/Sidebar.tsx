"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowSquareOutIcon, CaretUpDownIcon, KeyIcon, SignInIcon, SignOutIcon } from "@phosphor-icons/react";
import { AdminLogo } from "@/components/admin/shell/Logo";
import { ADMIN_NAV, isActive } from "@/components/admin/shell/nav";
import { useDismiss } from "@/components/admin/shell/useDismiss";
import { cn } from "@/lib/format";
import type { SessionUserLite } from "@/components/admin/shell/AdminShell";

interface SidebarProps {
  user: SessionUserLite;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  /** Sign-in is switched off (ADMIN_AUTH_DISABLED): show "View Site" instead of "Log Out". */
  noLogin?: boolean;
  onLogout: () => void;
  onChangePassword: () => void;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function SidebarBody({ user, collapsed, noLogin, onLogout, onChangePassword, onNavigate }: Omit<SidebarProps, "mobileOpen" | "onCloseMobile"> & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const profile = useRef<HTMLDivElement>(null);
  useDismiss(profile, menu, () => setMenu(false));

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-14 items-center border-b border-adm-border", collapsed ? "justify-center px-2" : "px-5")}>
        <Link href="/admin" onClick={onNavigate} aria-label="Dashboard">
          <AdminLogo compact={collapsed} />
        </Link>
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map(({ href, label, icon: NavIcon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-md text-[13px] font-medium transition-colors",
                collapsed ? "justify-center px-0" : "px-3",
                active ? "text-white" : "text-adm-muted hover:bg-adm-card2 hover:text-adm-text",
              )}
            >
              {active && <motion.span layoutId="adm-nav-active" className="absolute inset-0 rounded-md bg-adm-red" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <NavIcon size={19} weight={active ? "fill" : "light"} className="relative shrink-0" />
              {!collapsed && <span className="relative truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div ref={profile} className="relative border-t border-adm-border p-3">
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-3 bottom-full left-3 mb-2 min-w-48 overflow-hidden rounded-lg border border-adm-border bg-adm-card2 py-1 shadow-xl"
            >
              <Link href="/" target="_blank" className="flex items-center gap-2.5 px-3 py-2 text-sm text-adm-text hover:bg-adm-card">
                <ArrowSquareOutIcon size={16} /> View website
              </Link>
              {!user.viewOnly && (
                <button type="button" onClick={onChangePassword} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-adm-text hover:bg-adm-card">
                  <KeyIcon size={16} /> Change password
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-expanded={menu}
          className={cn("flex w-full items-center gap-3 rounded-md p-1.5 text-left hover:bg-adm-card2", collapsed && "justify-center")}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-adm-red text-xs font-semibold text-white">{initials(user.name)}</span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-adm-text">{user.name}</span>
                <span className="block truncate text-[11px] text-adm-muted">{user.viewOnly ? "View-only demo" : user.role === "admin" ? "System Administrator" : "Staff"}</span>
              </span>
              <CaretUpDownIcon size={14} className="text-adm-muted" />
            </>
          )}
        </button>
        {user.viewOnly ? (
          <Link
            href="/admin/login"
            className={cn("mt-1 flex h-9 w-full items-center gap-3 rounded-md text-sm text-adm-muted hover:bg-adm-card2 hover:text-adm-text", collapsed ? "justify-center" : "px-3")}
            title="Sign in"
          >
            <SignInIcon size={18} />
            {!collapsed && "Sign In"}
          </Link>
        ) : noLogin ? (
          <Link
            href="/"
            target="_blank"
            className={cn("mt-1 flex h-9 w-full items-center gap-3 rounded-md text-sm text-adm-muted hover:bg-adm-card2 hover:text-adm-text", collapsed ? "justify-center" : "px-3")}
            title="View site"
          >
            <ArrowSquareOutIcon size={18} />
            {!collapsed && "View Site"}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            className={cn("mt-1 flex h-9 w-full items-center gap-3 rounded-md text-sm text-adm-muted hover:bg-adm-card2 hover:text-adm-red", collapsed ? "justify-center" : "px-3")}
            title="Log out"
          >
            <SignOutIcon size={18} />
            {!collapsed && "Log Out"}
          </button>
        )}
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const { collapsed, mobileOpen, onCloseMobile } = props;
  return (
    <>
      {/* Desktop: fixed, collapsible */}
      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1, width: collapsed ? 76 : 248 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-adm-border bg-adm-side lg:block"
      >
        <SidebarBody {...props} />
      </motion.aside>

      {/* Mobile and tablet: slide-out drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[272px] border-r border-adm-border bg-adm-side lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <SidebarBody {...props} collapsed={false} onNavigate={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
