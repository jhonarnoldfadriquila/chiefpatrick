"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, PaintBrushIcon, PhoneIcon, PlusIcon, ShareNetworkIcon, StorefrontIcon, TrashIcon, type Icon } from "@phosphor-icons/react";
import { SETTINGS_TITLES, SettingsModal } from "@/components/admin/forms/ContentModals";
import { useForm } from "@/components/admin/forms/useForm";
import { PageHeader } from "@/components/admin/page-kit";
import { Button, ErrorState, Field, inputCls, LoadingRows, Modal, Panel, useConfirm, useToast } from "@/components/admin/ui";
import { api, shortDate, useApi } from "@/lib/admin/api";
import type { SettingsKey, SiteSettings, UserRecord } from "@/types/admin";

const ROWS: { key: Exclude<SettingsKey, "kiddie">; icon: Icon; summary: (s: SiteSettings) => string }[] = [
  { key: "restaurant", icon: StorefrontIcon, summary: (s) => `${s.restaurant.name} · since ${s.restaurant.founded}` },
  { key: "contact", icon: PhoneIcon, summary: (s) => `${s.contact.branches.length} branches · ${s.contact.hours}` },
  { key: "social", icon: ShareNetworkIcon, summary: (s) => [s.social.facebook && "Facebook", s.social.instagram && "Instagram", s.social.tiktok && "TikTok", s.social.youtube && "YouTube"].filter(Boolean).join(", ") || "None set" },
  { key: "seo", icon: MagnifyingGlassIcon, summary: (s) => s.seo.title },
  { key: "appearance", icon: PaintBrushIcon, summary: (s) => `Accent ${s.appearance.accentColor} · loading screen ${s.appearance.showPreloader ? "on" : "off"}` },
];

function StaffAccounts({ currentUserId }: { currentUserId: number }) {
  const { data, error, reload } = useApi<UserRecord[]>("/api/admin/users");
  const [open, setOpen] = useState(false);
  const form = useForm({ name: "", email: "", password: "", role: "staff" });
  const { confirm, dialog } = useConfirm();
  const toast = useToast();

  const save = async () => {
    if (await form.submit((v) => api.post("/api/admin/users", v), "Account created.")) {
      setOpen(false);
      form.setValues({ name: "", email: "", password: "", role: "staff" });
      reload();
    }
  };

  return (
    <Panel title="Staff accounts" action={<Button size="sm" variant="secondary" onClick={() => setOpen(true)}><PlusIcon size={14} /> Add account</Button>}>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <LoadingRows rows={2} />
      ) : (
        <ul className="divide-y divide-adm-border/60">
          {data.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-[13px]">
              <span className="min-w-40 flex-1">
                <span className="block font-medium text-adm-text">{u.name}{u.id === currentUserId && <span className="text-adm-muted"> (you)</span>}</span>
                <span className="block text-[11px] text-adm-muted">{u.email}</span>
              </span>
              <span className="rounded-full bg-adm-card2 px-2.5 py-0.5 text-[11px] text-adm-muted capitalize">{u.role}</span>
              <span className="text-[11px] text-adm-muted">since {shortDate(u.createdAt)}</span>
              {u.id !== currentUserId && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!(await confirm(`Delete ${u.name}'s account?`))) return;
                    try {
                      await api.del(`/api/admin/users/${u.id}`);
                      toast("success", "Account deleted.");
                      reload();
                    } catch (e) {
                      toast("error", (e as Error).message);
                    }
                  }}
                  className="inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-red/10 hover:text-adm-red"
                  aria-label={`Delete ${u.name}`}
                >
                  <TrashIcon size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Add staff account" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} loading={form.saving}>Create</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={form.errors.name}>{(id) => <input id={id} className={inputCls} value={form.values.name} onChange={(e) => form.set("name", e.target.value)} />}</Field>
          <Field label="Email" error={form.errors.email}>{(id) => <input id={id} type="email" className={inputCls} value={form.values.email} onChange={(e) => form.set("email", e.target.value)} />}</Field>
          <Field label="Temporary password (8+ characters)" error={form.errors.password}>{(id) => <input id={id} type="password" className={inputCls} value={form.values.password} onChange={(e) => form.set("password", e.target.value)} />}</Field>
          <Field label="Role" error={form.errors.role} hint="Admins can also change settings and delete records.">
            {(id) => (
              <select id={id} className={inputCls} value={form.values.role} onChange={(e) => form.set("role", e.target.value)}>
                <option value="staff">Staff</option>
                <option value="admin">Administrator</option>
              </select>
            )}
          </Field>
        </div>
      </Modal>
      {dialog}
    </Panel>
  );
}

function DemoData() {
  const { data, reload } = useApi<{ reservations: number; events: number; inquiries: number }>("/api/admin/demo");
  const [busy, setBusy] = useState(false);
  const { confirm, dialog } = useConfirm();
  const toast = useToast();
  const total = data ? data.reservations + data.events + data.inquiries : 0;

  return (
    <Panel title="Demo data" bodyClassName="p-4">
      <p className="text-sm text-adm-muted">
        {data
          ? total > 0
            ? `The dashboard is showing sample records: ${data.reservations} reservations, ${data.events} events and ${data.inquiries} inquiries, plus sample prices and sales on five dishes.`
            : "No sample records left. Everything you see is real."
          : "Checking…"}
      </p>
      {total > 0 && (
        <Button
          variant="secondary"
          className="mt-3"
          loading={busy}
          onClick={async () => {
            if (!(await confirm("Remove all sample reservations, events, inquiries and dish stats? Your real menu, packages, gallery and venues are not touched."))) return;
            setBusy(true);
            try {
              await api.del("/api/admin/demo");
              toast("success", "Demo data removed.");
              reload();
            } catch (e) {
              toast("error", (e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Remove demo data
        </Button>
      )}
      {dialog}
    </Panel>
  );
}

export function SettingsPage({ currentUserId, isAdmin }: { currentUserId: number; isAdmin: boolean }) {
  const { data, error, reload } = useApi<SiteSettings>("/api/admin/settings");
  const [group, setGroup] = useState<Exclude<SettingsKey, "kiddie"> | null>(null);

  return (
    <>
      <PageHeader title="Website Settings" subtitle={isAdmin ? "Business details, links and appearance used across the website." : "Only administrators can change these."} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Website">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : !data ? (
            <LoadingRows rows={5} />
          ) : (
            <ul className="divide-y divide-adm-border/60">
              {ROWS.map(({ key, icon: RowIcon, summary }) => (
                <li key={key} className="flex items-center gap-3 px-4 py-3">
                  <span className="grid size-9 place-items-center rounded-md bg-adm-card2 text-adm-text"><RowIcon size={18} weight="light" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-adm-text">{SETTINGS_TITLES[key]}</span>
                    <span className="block truncate text-xs text-adm-muted">{summary(data)}</span>
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => setGroup(key)} disabled={!isAdmin}>Edit</Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <div className="space-y-4">
          {isAdmin && <StaffAccounts currentUserId={currentUserId} />}
          {isAdmin && <DemoData />}
        </div>
      </div>
      <SettingsModal group={group} open={!!group} onClose={() => setGroup(null)} onSaved={reload} />
    </>
  );
}
