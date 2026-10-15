"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import Link from "next/link";
import { EyeIcon, FacebookLogoIcon, InstagramLogoIcon } from "@phosphor-icons/react";
import { Header } from "@/components/admin/shell/Header";
import { AdminLogo } from "@/components/admin/shell/Logo";
import { Sidebar } from "@/components/admin/shell/Sidebar";
import { Button, Field, inputCls, Modal, ToastProvider, useToast } from "@/components/admin/ui";
import { api, ApiClientError } from "@/lib/admin/api";
import { cn } from "@/lib/format";

export interface SessionUserLite {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
  viewOnly?: boolean;
}

function PasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) return setErrors({ confirm: "The passwords don't match." });
    setSaving(true);
    setErrors({});
    try {
      await api.patch("/api/admin/account/password", { current: form.current, next: form.next });
      toast("success", "Password changed. Please sign in again.");
      router.push("/admin/login");
    } catch (err) {
      const e2 = err as ApiClientError;
      setErrors(e2.fields ?? { current: e2.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Change password" size="sm">
      <form onSubmit={submit} className="space-y-4">
        {(["current", "next", "confirm"] as const).map((k) => (
          <Field key={k} label={k === "current" ? "Current password" : k === "next" ? "New password (8+ characters)" : "Confirm new password"} error={errors[k]}>
            {(id) => (
              <input id={id} type="password" required minLength={k === "current" ? 1 : 8} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={inputCls} aria-invalid={!!errors[k]} />
            )}
          </Field>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save password
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AdminFooter() {
  return (
    <footer className="mt-8 flex flex-col items-center gap-3 border-t border-adm-border px-4 py-4 text-xs text-adm-muted md:flex-row md:justify-between md:px-6">
      <AdminLogo className="scale-90" />
      <p className="italic">Good Food. Great Company.</p>
      <div className="flex items-center gap-4">
        <span>&copy; {new Date().getFullYear()} Chef Patrick&rsquo;s Kitchen. All rights reserved.</span>
        <a href="https://www.facebook.com/chef.pat.kitchen82/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-adm-text">
          <FacebookLogoIcon size={18} />
        </a>
        <a href="https://www.instagram.com/chefpatrickskitchen/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-adm-text">
          <InstagramLogoIcon size={18} />
        </a>
      </div>
    </footer>
  );
}

/** Sidebar + header + content + footer for every signed-in admin page. */
export function AdminShell({ user, noLogin = false, children }: { user: SessionUserLite; noLogin?: boolean; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("cpk-admin-collapsed") === "1");
    } catch {}
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem("cpk-admin-collapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout").catch(() => {});
    router.push("/admin/login");
    router.refresh();
  }, [router]);

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <div className="min-h-svh bg-adm-bg font-sans text-adm-text">
          <Sidebar user={user} collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} noLogin={noLogin} onLogout={logout} onChangePassword={() => setPwOpen(true)} />
          <div className={cn("flex min-h-svh min-w-0 flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
            <Header user={user} onToggleSidebar={toggle} onOpenMobile={() => setMobileOpen(true)} noLogin={noLogin} onLogout={logout} onChangePassword={() => setPwOpen(true)} />
            {user.viewOnly && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-adm-border bg-adm-card px-4 py-2 text-[13px] text-adm-muted md:px-6">
                <EyeIcon size={16} className="text-adm-red" />
                <span>View-only demo: you can look around, but changes won&apos;t be saved.</span>
                <Link href="/admin/login" className="font-medium text-adm-text underline-offset-2 hover:text-adm-red hover:underline">
                  Sign in to edit
                </Link>
              </div>
            )}
            <main className="min-w-0 flex-1 px-4 py-5 md:px-6">{children}</main>
            <AdminFooter />
          </div>
          <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
        </div>
      </ToastProvider>
    </MotionConfig>
  );
}
