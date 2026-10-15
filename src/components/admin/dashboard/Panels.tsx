"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarPlusIcon,
  ChatsCircleIcon,
  ForkKnifeIcon,
  GearSixIcon,
  GlobeIcon,
  ImageIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  PaintBrushIcon,
  PhoneIcon,
  PlusIcon,
  ShareNetworkIcon,
  StorefrontIcon,
  CalendarIcon,
  EyeIcon,
  type Icon,
} from "@phosphor-icons/react";
import { eventTypeLabel } from "@/components/admin/forms/BookingModals";
import { SETTINGS_TITLES } from "@/components/admin/forms/ContentModals";
import { EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { peso, time12 } from "@/lib/admin/api";
import type { EventRecord, GalleryRecord, InquiryRecord, MenuItemRecord, ReservationRecord, SettingsKey } from "@/types/admin";

const viewAll = (href: string) => (
  <Link href={href} className="text-xs font-medium text-adm-red hover:text-adm-red-hover">
    View All
  </Link>
);

const th = "px-3 py-2.5 text-left text-[11px] font-medium tracking-wide whitespace-nowrap text-adm-muted uppercase first:pl-4 last:pr-4";
const td = "px-3 py-2.5 text-[13px] whitespace-nowrap text-adm-text first:pl-4 last:pr-4";
// Short date and time for dense tables ("Oct 17, 6:00 PM"); the year is shown only when it differs.
const compactDate = (date: string, time?: string | null) => {
  const d = new Date(`${date}T00:00:00`);
  const label = d.toLocaleDateString("en-PH", { month: "short", day: "numeric", ...(d.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}) });
  return time ? `${label}, ${time12(time)}` : label;
};
const rowMotion = (i: number) => ({ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25, delay: 0.04 * i } });

// ---------- recent reservations ----------

export function RecentReservations({ rows, onView }: { rows: ReservationRecord[]; onView: (id: number) => void }) {
  return (
    <Panel title="Recent Reservations" action={viewAll("/admin/reservations")}>
      {rows.length === 0 ? (
        <EmptyState>No reservations yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-adm-border">
              <tr>
                <th className={th}>Customer Name</th>
                <th className={th}>Event Type</th>
                <th className={th}>Date &amp; Time</th>
                <th className={th}>Guests</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr key={r.id} {...rowMotion(i)} className="border-b border-adm-border/60 last:border-0 hover:bg-adm-card2/60">
                  <td className={`${td} font-medium`}>{r.name}</td>
                  <td className={`${td} text-adm-muted`}>{eventTypeLabel(r.eventType)}</td>
                  <td className={`${td} whitespace-nowrap text-adm-muted`}>
                    {compactDate(r.date, r.time)}
                  </td>
                  <td className={`${td} tabular-nums`}>{r.guests}</td>
                  <td className={td}>
                    <StatusBadge status={r.status} />
                  </td>
                  <td className={`${td} text-right`}>
                    <button
                      type="button"
                      onClick={() => onView(r.id)}
                      aria-label={`View reservation from ${r.name}`}
                      title="View"
                      className="inline-grid size-7 place-items-center rounded-md border border-adm-border text-adm-text hover:border-adm-red hover:text-adm-red"
                    >
                      <EyeIcon size={15} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// ---------- quick actions ----------

const ACTIONS: { label: string; href: string; icon: Icon }[] = [
  { label: "Add Menu Item", href: "/admin/menu?new=1", icon: ForkKnifeIcon },
  { label: "Create Package", href: "/admin/packages?new=1", icon: PackageIcon },
  { label: "Add Event", href: "/admin/events?new=1", icon: CalendarPlusIcon },
  { label: "View Reservations", href: "/admin/reservations", icon: CalendarIcon },
  { label: "Manage Inquiries", href: "/admin/inquiries", icon: ChatsCircleIcon },
  { label: "Update Settings", href: "/admin/settings", icon: GearSixIcon },
];

export function QuickActions() {
  return (
    <Panel title="Quick Actions" bodyClassName="p-3">
      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map(({ label, href, icon: ActionIcon }) => (
          <motion.div key={label} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.15 }}>
            <Link
              href={href}
              className="group flex h-[86px] flex-col items-center justify-center gap-2 rounded-md border border-adm-border bg-adm-card2/50 px-2 text-center transition-colors hover:border-adm-red/70 hover:bg-adm-card2"
            >
              <ActionIcon size={24} weight="light" className="text-adm-text transition-colors group-hover:text-adm-red" />
              <span className="text-[11px] leading-tight text-adm-muted group-hover:text-adm-text">{label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
}

// ---------- recent inquiries ----------

export function RecentInquiries({ rows, onView }: { rows: InquiryRecord[]; onView: (id: number) => void }) {
  return (
    <Panel title="Recent Inquiries" action={viewAll("/admin/inquiries")}>
      {rows.length === 0 ? (
        <EmptyState>No inquiries yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-adm-border">
              <tr>
                <th className={th}>Name / Email</th>
                <th className={th}>Subject</th>
                <th className={`${th} hidden 2xl:table-cell`}>Date</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr key={r.id} {...rowMotion(i)} onClick={() => onView(r.id)} className="cursor-pointer border-b border-adm-border/60 last:border-0 hover:bg-adm-card2/60">
                  <td className={`${td} font-medium`}>
                    <button type="button" className="block text-left hover:text-adm-red" onClick={(e) => (e.stopPropagation(), onView(r.id))}>
                      {r.name}
                    </button>
                    <span className="block max-w-36 truncate text-[11px] font-normal text-adm-muted">{r.email}</span>
                  </td>
                  <td className={`${td} max-w-32 truncate text-adm-muted`}>{r.subject}</td>
                  <td className={`${td} hidden text-adm-muted 2xl:table-cell`}>{compactDate(r.createdAt.slice(0, 10))}</td>
                  <td className={td}>
                    <StatusBadge status={r.status} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// ---------- popular menu items ----------

export function PopularMenuItems({ rows, onEdit }: { rows: MenuItemRecord[]; onEdit: (id: number) => void }) {
  return (
    <Panel title="Popular Menu Items" action={viewAll("/admin/menu")}>
      {rows.length === 0 ? (
        <EmptyState>Add &ldquo;sold&rdquo; counts to dishes in Menu Management to see your best sellers here.</EmptyState>
      ) : (
        <ul className="divide-y divide-adm-border/60">
          {rows.map((m, i) => (
            <motion.li key={m.id} {...rowMotion(i)} className="flex items-center gap-3 px-4 py-2.5">
              <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-md bg-adm-card2 text-adm-muted">
                {m.image ? <Image src={m.image} alt="" fill sizes="44px" className="object-cover" /> : <ForkKnifeIcon size={18} weight="light" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-adm-text">{m.name}</span>
                <span className="block text-[11px] text-adm-muted">Sold: {m.sold}</span>
              </span>
              <span className="text-[13px] font-semibold text-adm-text tabular-nums">{peso(m.price)}</span>
              <button type="button" onClick={() => onEdit(m.id)} className="rounded-md border border-adm-border px-2.5 py-1 text-xs text-adm-text hover:border-adm-red hover:text-adm-red">
                Edit
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// ---------- latest events ----------

export function LatestEvents({ rows, onView }: { rows: EventRecord[]; onView: (id: number) => void }) {
  return (
    <Panel title="Latest Events" action={viewAll("/admin/events")}>
      {rows.length === 0 ? (
        <EmptyState>No upcoming events.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-adm-border">
              <tr>
                <th className={th}>Event Name</th>
                <th className={th}>Date</th>
                <th className={`${th} hidden 2xl:table-cell`}>Location</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => (
                <motion.tr key={e.id} {...rowMotion(i)} onClick={() => onView(e.id)} className="cursor-pointer border-b border-adm-border/60 last:border-0 hover:bg-adm-card2/60">
                  <td className={`${td} font-medium`}>
                    <button type="button" className="text-left hover:text-adm-red" onClick={(ev) => (ev.stopPropagation(), onView(e.id))}>
                      {e.name}
                    </button>
                  </td>
                  <td className={`${td} text-adm-muted`}>{compactDate(e.date)}</td>
                  <td className={`${td} hidden max-w-28 truncate text-adm-muted 2xl:table-cell`}>{e.location || "—"}</td>
                  <td className={td}>
                    <StatusBadge status={e.status} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// ---------- gallery uploads ----------

export function GalleryUploads({ photos, total, onUpload, onPreview }: { photos: GalleryRecord[]; total: number; onUpload: () => void; onPreview: (p: GalleryRecord) => void }) {
  return (
    <Panel title="Gallery Uploads" action={viewAll("/admin/gallery")} bodyClassName="p-3">
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onPreview(p)}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="group relative aspect-square overflow-hidden rounded-md bg-adm-card2"
            aria-label={`Preview: ${p.caption ?? p.alt}`}
          >
            <Image src={p.src} alt={p.alt} fill sizes="120px" className="object-cover transition-transform duration-300 group-hover:scale-110" />
          </motion.button>
        ))}
        <button
          type="button"
          onClick={onUpload}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-adm-border text-adm-muted transition-colors hover:border-adm-red hover:text-adm-red"
        >
          <PlusIcon size={22} />
          <span className="text-[11px]">Upload Photo</span>
        </button>
      </div>
      <p className="mt-2 px-1 text-[11px] text-adm-muted">
        <ImageIcon size={12} className="mr-1 inline" />
        {total} photos on the website
      </p>
    </Panel>
  );
}

// ---------- website settings ----------

const SETTINGS_ROWS: { key: Exclude<SettingsKey, "kiddie">; icon: Icon }[] = [
  { key: "restaurant", icon: StorefrontIcon },
  { key: "contact", icon: PhoneIcon },
  { key: "social", icon: ShareNetworkIcon },
  { key: "seo", icon: MagnifyingGlassIcon },
  { key: "appearance", icon: PaintBrushIcon },
];

export function WebsiteSettingsPanel({ onEdit }: { onEdit: (k: Exclude<SettingsKey, "kiddie">) => void }) {
  return (
    <Panel title="Website Settings" action={viewAll("/admin/settings")}>
      <ul className="divide-y divide-adm-border/60">
        {SETTINGS_ROWS.map(({ key, icon: RowIcon }, i) => (
          <motion.li key={key} {...rowMotion(i)} className="flex items-center gap-3 px-4 py-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-adm-card2 text-adm-text">
              <RowIcon size={17} weight="light" />
            </span>
            <span className="flex-1 text-[13px] text-adm-text">{SETTINGS_TITLES[key]}</span>
            <button type="button" onClick={() => onEdit(key)} className="rounded-md border border-adm-border px-2.5 py-1 text-xs text-adm-text hover:border-adm-red hover:text-adm-red">
              Edit
            </button>
          </motion.li>
        ))}
      </ul>
      <p className="flex items-center gap-1.5 border-t border-adm-border px-4 py-2.5 text-[11px] text-adm-muted">
        <GlobeIcon size={13} /> Changes appear on the website right away.
      </p>
    </Panel>
  );
}
