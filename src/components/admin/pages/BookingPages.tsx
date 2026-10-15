"use client";

// Reservations, Events and Inquiries management pages.
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DownloadSimpleIcon, EyeIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { EventModal, eventTypeLabel, InquiryModal, ReservationModal } from "@/components/admin/forms/BookingModals";
import { PageHeader, SearchBox, StatusTabs, td, th, useDeepLink } from "@/components/admin/page-kit";
import { Button, EmptyState, ErrorState, LoadingRows, Pager, Panel, StatusBadge, useConfirm, useToast } from "@/components/admin/ui";
import { api, peso, shortDate, time12, useApi } from "@/lib/admin/api";
import { EVENT_STATUSES, INQUIRY_STATUSES, RESERVATION_STATUSES, type EventRecord, type InquiryRecord, type ReservationRecord } from "@/types/admin";

const PAGE_SIZE = 15;

function useListState(defaultSort: string) {
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(defaultSort);
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const query = `status=${status}&q=${encodeURIComponent(q)}&page=${page}&pageSize=${PAGE_SIZE}&sort=${sort}&dir=${dir}`;
  const onSearch = useCallback((v: string) => {
    setQ(v);
    setPage(1);
  }, []);
  const toggleSort = (key: string) => {
    if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDir("desc");
    }
  };
  return { status, setStatus: (s: string) => (setStatus(s), setPage(1)), q, onSearch, page, setPage, sort, dir, toggleSort, query };
}

function SortTh({ label, k, state }: { label: string; k: string; state: ReturnType<typeof useListState> }) {
  return (
    <th className={th} aria-sort={state.sort === k ? (state.dir === "asc" ? "ascending" : "descending") : undefined}>
      <button type="button" onClick={() => state.toggleSort(k)} className="uppercase hover:text-adm-text">
        {label} {state.sort === k ? (state.dir === "asc" ? "↑" : "↓") : ""}
      </button>
    </th>
  );
}

const rowMotion = (i: number) => ({ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2, delay: Math.min(i, 10) * 0.025 } });

// ---------- reservations ----------

export function ReservationsPage() {
  const list = useListState("created");
  const { data, meta, error, loading, reload } = useApi<ReservationRecord[]>(`/api/admin/reservations?${list.query}`);
  const deep = useDeepLink();
  const [modal, setModal] = useState<{ id: number | null } | null>(null);
  const { confirm, dialog } = useConfirm();
  const toast = useToast();

  useEffect(() => {
    if (deep.open) setModal({ id: deep.open });
    else if (deep.isNew) setModal({ id: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deep.open, deep.isNew]);

  const remove = async (r: ReservationRecord) => {
    if (!(await confirm(`Delete the reservation from ${r.name}? This can't be undone.`))) return;
    try {
      await api.del(`/api/admin/reservations/${r.id}`);
      toast("success", "Reservation deleted.");
      reload();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Reservations"
        subtitle="Booking requests from the website, plus reservations you log by phone."
        actions={
          <>
            <a href={`/api/admin/reservations/export?status=${list.status}&q=${encodeURIComponent(list.q)}`} className="inline-flex h-9 items-center gap-2 rounded-md border border-adm-border bg-adm-card2 px-4 text-sm hover:border-adm-muted/50">
              <DownloadSimpleIcon size={16} /> Export CSV
            </a>
            <Button onClick={() => setModal({ id: null })}>
              <PlusIcon size={16} /> New reservation
            </Button>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatusTabs options={RESERVATION_STATUSES} value={list.status} onChange={list.setStatus} />
        <SearchBox value={list.q} onChange={list.onSearch} placeholder="Search name, email, phone…" />
      </div>
      <Panel>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data ? (
          <LoadingRows rows={8} />
        ) : data.length === 0 ? (
          <EmptyState>{list.q || list.status !== "all" ? "No reservations match this filter." : "No reservations yet."}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full min-w-[820px] transition-opacity ${loading ? "opacity-60" : ""}`}>
              <thead className="border-b border-adm-border">
                <tr>
                  <SortTh label="Customer" k="name" state={list} />
                  <th className={th}>Event</th>
                  <SortTh label="Date & time" k="date" state={list} />
                  <SortTh label="Guests" k="guests" state={list} />
                  <th className={th}>Status</th>
                  <SortTh label="Received" k="created" state={list} />
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <motion.tr key={r.id} {...rowMotion(i)} className="border-b border-adm-border/60 last:border-0 hover:bg-adm-card2/60">
                    <td className={td}>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-[11px] text-adm-muted">{r.phone}</p>
                    </td>
                    <td className={`${td} text-adm-muted`}>{eventTypeLabel(r.eventType)}</td>
                    <td className={`${td} whitespace-nowrap text-adm-muted`}>
                      {shortDate(r.date)}, {time12(r.time)}
                    </td>
                    <td className={`${td} tabular-nums`}>{r.guests}</td>
                    <td className={td}>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className={`${td} whitespace-nowrap text-adm-muted`}>{shortDate(r.createdAt)}</td>
                    <td className={`${td} text-right whitespace-nowrap`}>
                      <Button size="sm" variant="secondary" onClick={() => setModal({ id: r.id })}>
                        <EyeIcon size={14} /> View
                      </Button>
                      <button type="button" onClick={() => remove(r)} aria-label={`Delete reservation from ${r.name}`} className="ml-1 inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-red/10 hover:text-adm-red">
                        <TrashIcon size={15} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={list.page} pageSize={PAGE_SIZE} total={Number(meta.total ?? 0)} onPage={list.setPage} />
      </Panel>
      <ReservationModal
        id={modal?.id ?? null}
        open={!!modal}
        onClose={() => {
          setModal(null);
          if (deep.open || deep.isNew) deep.clear();
        }}
        onSaved={reload}
      />
      {dialog}
    </>
  );
}

// ---------- events ----------

export function EventsPage() {
  const list = useListState("date");
  const { data, meta, error, loading, reload } = useApi<EventRecord[]>(`/api/admin/events?${list.query}`);
  const deep = useDeepLink();
  const [modal, setModal] = useState<{ id: number | null } | null>(null);
  const { confirm, dialog } = useConfirm();
  const toast = useToast();

  useEffect(() => {
    if (deep.open) setModal({ id: deep.open });
    else if (deep.isNew) setModal({ id: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deep.open, deep.isNew]);

  const remove = async (e: EventRecord) => {
    if (!(await confirm(`Delete "${e.name}"?`))) return;
    try {
      await api.del(`/api/admin/events/${e.id}`);
      toast("success", "Event deleted.");
      reload();
    } catch (err) {
      toast("error", (err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Booked events and their contract amounts. Confirmed and completed events feed the revenue chart."
        actions={
          <Button onClick={() => setModal({ id: null })}>
            <PlusIcon size={16} /> Add event
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatusTabs options={EVENT_STATUSES} value={list.status} onChange={list.setStatus} />
        <SearchBox value={list.q} onChange={list.onSearch} placeholder="Search event or location…" />
      </div>
      <Panel>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data ? (
          <LoadingRows rows={8} />
        ) : data.length === 0 ? (
          <EmptyState>{list.q || list.status !== "all" ? "No events match this filter." : "No events yet. Add one, or create one from a reservation."}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full min-w-[760px] transition-opacity ${loading ? "opacity-60" : ""}`}>
              <thead className="border-b border-adm-border">
                <tr>
                  <SortTh label="Event" k="name" state={list} />
                  <SortTh label="Date" k="date" state={list} />
                  <th className={th}>Location</th>
                  <th className={th}>Guests</th>
                  <SortTh label="Amount" k="amount" state={list} />
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((e, i) => (
                  <motion.tr key={e.id} {...rowMotion(i)} className="border-b border-adm-border/60 last:border-0 hover:bg-adm-card2/60">
                    <td className={td}>
                      <p className="font-medium">{e.name}</p>
                      <p className="text-[11px] text-adm-muted">{eventTypeLabel(e.eventType)}</p>
                    </td>
                    <td className={`${td} whitespace-nowrap text-adm-muted`}>
                      {shortDate(e.date)}
                      {e.time ? `, ${time12(e.time)}` : ""}
                    </td>
                    <td className={`${td} text-adm-muted`}>{e.location || "—"}</td>
                    <td className={`${td} tabular-nums`}>{e.guests}</td>
                    <td className={`${td} tabular-nums`}>{peso(e.amount)}</td>
                    <td className={td}>
                      <StatusBadge status={e.status} />
                    </td>
                    <td className={`${td} text-right whitespace-nowrap`}>
                      <Button size="sm" variant="secondary" onClick={() => setModal({ id: e.id })}>
                        Edit
                      </Button>
                      <button type="button" onClick={() => remove(e)} aria-label={`Delete ${e.name}`} className="ml-1 inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-red/10 hover:text-adm-red">
                        <TrashIcon size={15} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={list.page} pageSize={PAGE_SIZE} total={Number(meta.total ?? 0)} onPage={list.setPage} />
      </Panel>
      <EventModal
        id={modal?.id ?? null}
        open={!!modal}
        onClose={() => {
          setModal(null);
          if (deep.open || deep.isNew) deep.clear();
        }}
        onSaved={reload}
      />
      {dialog}
    </>
  );
}

// ---------- inquiries ----------

export function InquiriesPage() {
  const list = useListState("created");
  const { data, meta, error, loading, reload } = useApi<InquiryRecord[]>(`/api/admin/inquiries?${list.query}`);
  const deep = useDeepLink();
  const [modal, setModal] = useState<number | null>(null);
  const { confirm, dialog } = useConfirm();
  const toast = useToast();

  useEffect(() => {
    if (deep.open) setModal(deep.open);
  }, [deep.open]);

  const setStatus = async (i: InquiryRecord, status: string) => {
    try {
      await api.patch(`/api/admin/inquiries/${i.id}`, { status });
      toast("success", "Status updated.");
      reload();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  };

  const remove = async (i: InquiryRecord) => {
    if (!(await confirm(`Delete the inquiry from ${i.name}?`))) return;
    try {
      await api.del(`/api/admin/inquiries/${i.id}`);
      toast("success", "Inquiry deleted.");
      reload();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  };

  return (
    <>
      <PageHeader title="Inquiries" subtitle="Questions sent from the “Ask us anything” form on the Contact page." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatusTabs options={INQUIRY_STATUSES} value={list.status} onChange={list.setStatus} />
        <SearchBox value={list.q} onChange={list.onSearch} placeholder="Search name, email, subject…" />
      </div>
      <Panel>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data ? (
          <LoadingRows rows={8} />
        ) : data.length === 0 ? (
          <EmptyState>{list.q || list.status !== "all" ? "No inquiries match this filter." : "No inquiries yet."}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full min-w-[760px] transition-opacity ${loading ? "opacity-60" : ""}`}>
              <thead className="border-b border-adm-border">
                <tr>
                  <SortTh label="Name" k="name" state={list} />
                  <SortTh label="Subject" k="subject" state={list} />
                  <SortTh label="Date" k="created" state={list} />
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((i, idx) => (
                  <motion.tr key={i.id} {...rowMotion(idx)} className="border-b border-adm-border/60 last:border-0 hover:bg-adm-card2/60">
                    <td className={td}>
                      <p className="font-medium">{i.name}</p>
                      <p className="text-[11px] text-adm-muted">{i.email}</p>
                    </td>
                    <td className={td}>
                      <p>{i.subject}</p>
                      <p className="max-w-md truncate text-[11px] text-adm-muted">{i.message}</p>
                    </td>
                    <td className={`${td} whitespace-nowrap text-adm-muted`}>{shortDate(i.createdAt)}</td>
                    <td className={td}>
                      <select
                        value={i.status}
                        onChange={(e) => setStatus(i, e.target.value)}
                        aria-label={`Status of inquiry from ${i.name}`}
                        className="h-7 rounded-md border border-adm-border bg-adm-card2 px-2 text-xs text-adm-text outline-none focus:border-adm-red"
                      >
                        {INQUIRY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={`${td} text-right whitespace-nowrap`}>
                      <Button size="sm" variant="secondary" onClick={() => setModal(i.id)}>
                        <EyeIcon size={14} /> Open
                      </Button>
                      <button type="button" onClick={() => remove(i)} aria-label={`Delete inquiry from ${i.name}`} className="ml-1 inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-red/10 hover:text-adm-red">
                        <TrashIcon size={15} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={list.page} pageSize={PAGE_SIZE} total={Number(meta.total ?? 0)} onPage={list.setPage} />
      </Panel>
      <InquiryModal
        id={modal}
        open={modal !== null}
        onClose={() => {
          setModal(null);
          if (deep.open) deep.clear();
        }}
        onSaved={reload}
      />
      {dialog}
    </>
  );
}
