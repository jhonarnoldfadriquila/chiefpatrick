"use client";

import { useState } from "react";
import Image from "next/image";
import { DateRange, PRESETS, type Range } from "@/components/admin/dashboard/DateRange";
import { GalleryUploads, LatestEvents, PopularMenuItems, QuickActions, RecentInquiries, RecentReservations, WebsiteSettingsPanel } from "@/components/admin/dashboard/Panels";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { StatCards } from "@/components/admin/dashboard/StatCards";
import { EventModal, InquiryModal, ReservationModal } from "@/components/admin/forms/BookingModals";
import { MenuItemModal, SettingsModal, UploadPhotoModal } from "@/components/admin/forms/ContentModals";
import { ErrorState, LoadingRows, Modal } from "@/components/admin/ui";
import { useApi } from "@/lib/admin/api";
import type { EventRecord, GalleryRecord, InquiryRecord, MenuItemRecord, ReservationRecord, SettingsKey, StatCard } from "@/types/admin";

interface DashboardData {
  range: { from: string; to: string };
  cards: StatCard[];
  recentReservations: ReservationRecord[];
  recentInquiries: InquiryRecord[];
  latestEvents: EventRecord[];
  popularItems: MenuItemRecord[];
  gallery: GalleryRecord[];
  galleryCount: number;
}

type Open =
  | { kind: "reservation"; id: number }
  | { kind: "inquiry"; id: number }
  | { kind: "event"; id: number }
  | { kind: "menu"; id: number }
  | { kind: "upload" }
  | { kind: "photo"; photo: GalleryRecord }
  | { kind: "settings"; key: Exclude<SettingsKey, "kiddie"> }
  | null;

export function Dashboard({ userName }: { userName: string }) {
  const [range, setRange] = useState<Range>(PRESETS[1]);
  const { data, error, loading, reload } = useApi<DashboardData>(`/api/admin/dashboard?from=${range.from}&to=${range.to}`);
  const [open, setOpen] = useState<Open>(null);
  const close = () => setOpen(null);

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-adm-text">Dashboard</h1>
          <p className="mt-1 text-sm text-adm-muted">Welcome back, {userName}! Here&rsquo;s what&rsquo;s happening with your business today.</p>
        </div>
        <DateRange value={range} onChange={setRange} />
      </div>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <StatCards cards={data?.cards} loading={loading} />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <RevenueChart />
            {data ? <RecentReservations rows={data.recentReservations} onView={(id) => setOpen({ kind: "reservation", id })} /> : <LoadingRows rows={6} />}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <QuickActions />
            {data ? <RecentInquiries rows={data.recentInquiries} onView={(id) => setOpen({ kind: "inquiry", id })} /> : <LoadingRows />}
            {data ? <PopularMenuItems rows={data.popularItems} onEdit={(id) => setOpen({ kind: "menu", id })} /> : <LoadingRows />}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data ? <LatestEvents rows={data.latestEvents} onView={(id) => setOpen({ kind: "event", id })} /> : <LoadingRows />}
            {data ? (
              <GalleryUploads photos={data.gallery} total={data.galleryCount} onUpload={() => setOpen({ kind: "upload" })} onPreview={(photo) => setOpen({ kind: "photo", photo })} />
            ) : (
              <LoadingRows />
            )}
            <WebsiteSettingsPanel onEdit={(key) => setOpen({ kind: "settings", key })} />
          </div>
        </>
      )}

      <ReservationModal id={open?.kind === "reservation" ? open.id : null} open={open?.kind === "reservation"} onClose={close} onSaved={reload} />
      <InquiryModal id={open?.kind === "inquiry" ? open.id : null} open={open?.kind === "inquiry"} onClose={close} onSaved={reload} />
      <EventModal id={open?.kind === "event" ? open.id : null} open={open?.kind === "event"} onClose={close} onSaved={reload} />
      <MenuItemModal id={open?.kind === "menu" ? open.id : null} open={open?.kind === "menu"} onClose={close} onSaved={reload} />
      <UploadPhotoModal open={open?.kind === "upload"} onClose={close} onSaved={reload} />
      <SettingsModal group={open?.kind === "settings" ? open.key : null} open={open?.kind === "settings"} onClose={close} />
      <Modal open={open?.kind === "photo"} onClose={close} title={open?.kind === "photo" ? open.photo.caption ?? "Photo" : ""} size="lg">
        {open?.kind === "photo" && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-adm-bg">
            <Image src={open.photo.src} alt={open.photo.alt} fill sizes="768px" className="object-contain" />
          </div>
        )}
      </Modal>
    </div>
  );
}
