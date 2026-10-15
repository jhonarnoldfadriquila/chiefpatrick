"use client";

// Reservation, event and inquiry detail / edit modals.
import { useEffect, useState } from "react";
import { EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { useForm } from "@/components/admin/forms/useForm";
import { Button, Field, inputCls, Modal, Spinner, StatusBadge, statusLabel, useToast } from "@/components/admin/ui";
import { api, peso, shortDate, time12 } from "@/lib/admin/api";
import { EVENT_TYPES } from "@/types";
import { EVENT_STATUSES, INQUIRY_STATUSES, RESERVATION_STATUSES, type EventRecord, type InquiryRecord, type ReservationRecord } from "@/types/admin";

export const eventTypeLabel = (v: string) => EVENT_TYPES.find((t) => t.value === v)?.label ?? v;
const today = () => new Date().toISOString().slice(0, 10);

function useRecord<T>(url: string | null, open: boolean) {
  const [record, setRecord] = useState<T | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open || !url) return;
    setRecord(null);
    setError("");
    api.get<T>(url).then(setRecord).catch((e) => setError(e.message));
  }, [url, open]);
  return { record, error };
}

// ---------- reservations ----------

const EMPTY_RES = { name: "", email: "", phone: "", date: today(), time: "18:00", guests: 50 as number, eventType: "wedding", message: "", status: "pending", notes: "" };

export function ReservationModal({ id, open, onClose, onSaved }: { id: number | null; open: boolean; onClose: () => void; onSaved?: () => void }) {
  const isNew = id === null;
  const { record, error } = useRecord<ReservationRecord>(isNew ? null : `/api/admin/reservations/${id}`, open);
  const form = useForm<typeof EMPTY_RES>(EMPTY_RES);
  const toast = useToast();
  const [makingEvent, setMakingEvent] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isNew) form.setValues(EMPTY_RES);
    else if (record)
      form.setValues({ ...EMPTY_RES, ...record, message: record.message ?? "", notes: record.notes ?? "", guests: record.guests });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isNew, record]);

  const save = async () => {
    const ok = await form.submit(
      (v) => (isNew ? api.post("/api/admin/reservations", v) : api.patch(`/api/admin/reservations/${id}`, { status: v.status, notes: v.notes })),
      isNew ? "Reservation added." : "Reservation updated.",
    );
    if (ok) {
      onSaved?.();
      onClose();
    }
  };

  const toEvent = async () => {
    if (!record) return;
    setMakingEvent(true);
    try {
      await api.post("/api/admin/events", {
        name: `${eventTypeLabel(record.eventType)} - ${record.name.split(" ").slice(-1)[0]}`,
        eventType: record.eventType,
        date: record.date,
        time: record.time,
        guests: record.guests,
        amount: 0,
        status: record.status === "confirmed" ? "confirmed" : "pending",
        location: "",
        notes: `From reservation #${record.id}`,
      });
      toast("success", "Event created. Add the amount in Events.");
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setMakingEvent(false);
    }
  };

  const v = form.values;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? "New reservation" : "Reservation details"}
      size="lg"
      footer={
        <>
          {!isNew && record && (
            <Button variant="secondary" onClick={toEvent} loading={makingEvent} className="mr-auto">
              Create event from this
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={form.saving} disabled={!isNew && !record}>
            Save
          </Button>
        </>
      }
    >
      {error ? (
        <p className="text-sm text-adm-red">{error}</p>
      ) : !isNew && !record ? (
        <div className="grid place-items-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {isNew ? (
            <>
              <Field label="Customer name" error={form.errors.name}>{(fid) => <input id={fid} className={inputCls} value={v.name} onChange={(e) => form.set("name", e.target.value)} />}</Field>
              <Field label="Phone" error={form.errors.phone}>{(fid) => <input id={fid} className={inputCls} value={v.phone} onChange={(e) => form.set("phone", e.target.value)} />}</Field>
              <Field label="Email" error={form.errors.email} className="md:col-span-2">{(fid) => <input id={fid} type="email" className={inputCls} value={v.email} onChange={(e) => form.set("email", e.target.value)} />}</Field>
              <Field label="Event type" error={form.errors.eventType}>
                {(fid) => (
                  <select id={fid} className={inputCls} value={v.eventType} onChange={(e) => form.set("eventType", e.target.value)}>
                    {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Guests" error={form.errors.guests}>{(fid) => <input id={fid} type="number" min={1} className={inputCls} value={v.guests} onChange={(e) => form.set("guests", Number(e.target.value))} />}</Field>
              <Field label="Date" error={form.errors.date}>{(fid) => <input id={fid} type="date" className={inputCls} value={v.date} onChange={(e) => form.set("date", e.target.value)} />}</Field>
              <Field label="Time" error={form.errors.time}>{(fid) => <input id={fid} type="time" className={inputCls} value={v.time} onChange={(e) => form.set("time", e.target.value)} />}</Field>
              <Field label="Message" className="md:col-span-2">{(fid) => <textarea id={fid} rows={3} className={inputCls} value={v.message} onChange={(e) => form.set("message", e.target.value)} />}</Field>
            </>
          ) : (
            record && (
              <div className="space-y-3 md:col-span-1">
                <p className="text-lg font-semibold text-adm-text">{record.name}</p>
                <dl className="grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
                  <dt className="text-adm-muted">Event</dt><dd>{eventTypeLabel(record.eventType)}</dd>
                  <dt className="text-adm-muted">Date</dt><dd>{shortDate(record.date)}, {time12(record.time)}</dd>
                  <dt className="text-adm-muted">Guests</dt><dd>{record.guests}</dd>
                  <dt className="text-adm-muted">Received</dt><dd>{shortDate(record.createdAt)}</dd>
                </dl>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a href={`tel:${record.phone.replace(/\s/g, "")}`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-adm-border px-3 text-xs hover:border-adm-muted/50"><PhoneIcon size={14} /> {record.phone}</a>
                  <a href={`mailto:${record.email}`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-adm-border px-3 text-xs hover:border-adm-muted/50"><EnvelopeSimpleIcon size={14} /> {record.email}</a>
                </div>
                {record.message && <p className="rounded-md bg-adm-bg p-3 text-sm whitespace-pre-line text-adm-muted">{record.message}</p>}
                {record.isDemo && <p className="text-xs text-adm-yellow">Sample record (demo data)</p>}
              </div>
            )
          )}
          <div className="space-y-4">
            <Field label="Status">
              {(fid) => (
                <select id={fid} className={inputCls} value={v.status} onChange={(e) => form.set("status", e.target.value)}>
                  {RESERVATION_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              )}
            </Field>
            <Field label="Staff notes">{(fid) => <textarea id={fid} rows={isNew ? 3 : 6} className={inputCls} placeholder="Called back, sent quote, deposit paid…" value={v.notes} onChange={(e) => form.set("notes", e.target.value)} />}</Field>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ---------- events ----------

const EMPTY_EVENT = { name: "", eventType: "wedding", date: today(), time: "18:00", location: "", guests: 50 as number, amount: 0 as number, status: "pending", notes: "" };

export function EventModal({ id, open, onClose, onSaved }: { id: number | null; open: boolean; onClose: () => void; onSaved?: () => void }) {
  const isNew = id === null;
  const { record, error } = useRecord<EventRecord>(isNew ? null : `/api/admin/events/${id}`, open);
  const form = useForm<typeof EMPTY_EVENT>(EMPTY_EVENT);

  useEffect(() => {
    if (!open) return;
    if (isNew) form.setValues(EMPTY_EVENT);
    else if (record) form.setValues({ ...EMPTY_EVENT, ...record, time: record.time ?? "", notes: record.notes ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isNew, record]);

  const save = async () => {
    const ok = await form.submit((v) => (isNew ? api.post("/api/admin/events", v) : api.patch(`/api/admin/events/${id}`, v)), isNew ? "Event added." : "Event updated.");
    if (ok) {
      onSaved?.();
      onClose();
    }
  };

  const v = form.values;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? "New event" : "Event details"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={form.saving} disabled={!isNew && !record}>Save</Button>
        </>
      }
    >
      {error ? (
        <p className="text-sm text-adm-red">{error}</p>
      ) : !isNew && !record ? (
        <div className="grid place-items-center py-10"><Spinner /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Event name" error={form.errors.name} className="md:col-span-2">{(fid) => <input id={fid} className={inputCls} placeholder="e.g. Wedding - Santos" value={v.name} onChange={(e) => form.set("name", e.target.value)} />}</Field>
          <Field label="Type" error={form.errors.eventType}>
            {(fid) => (
              <select id={fid} className={inputCls} value={v.eventType} onChange={(e) => form.set("eventType", e.target.value)}>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            )}
          </Field>
          <Field label="Status" error={form.errors.status}>
            {(fid) => (
              <select id={fid} className={inputCls} value={v.status} onChange={(e) => form.set("status", e.target.value)}>
                {EVENT_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
            )}
          </Field>
          <Field label="Date" error={form.errors.date}>{(fid) => <input id={fid} type="date" className={inputCls} value={v.date} onChange={(e) => form.set("date", e.target.value)} />}</Field>
          <Field label="Time" error={form.errors.time}>{(fid) => <input id={fid} type="time" className={inputCls} value={v.time} onChange={(e) => form.set("time", e.target.value)} />}</Field>
          <Field label="Location" error={form.errors.location}>{(fid) => <input id={fid} className={inputCls} placeholder="e.g. CPK Main Hall" value={v.location} onChange={(e) => form.set("location", e.target.value)} />}</Field>
          <Field label="Guests" error={form.errors.guests}>{(fid) => <input id={fid} type="number" min={0} className={inputCls} value={v.guests} onChange={(e) => form.set("guests", Number(e.target.value))} />}</Field>
          <Field label="Contract amount (₱)" error={form.errors.amount} hint="Confirmed and completed events count toward revenue.">
            {(fid) => <input id={fid} type="number" min={0} step="0.01" className={inputCls} value={v.amount} onChange={(e) => form.set("amount", Number(e.target.value))} />}
          </Field>
          {record && <p className="self-end pb-2 text-sm text-adm-muted">Currently {peso(record.amount)}{record.isDemo ? " · sample record" : ""}</p>}
          <Field label="Notes" className="md:col-span-2">{(fid) => <textarea id={fid} rows={3} className={inputCls} value={v.notes} onChange={(e) => form.set("notes", e.target.value)} />}</Field>
        </div>
      )}
    </Modal>
  );
}

// ---------- inquiries ----------

export function InquiryModal({ id, open, onClose, onSaved }: { id: number | null; open: boolean; onClose: () => void; onSaved?: () => void }) {
  const { record, error } = useRecord<InquiryRecord>(id ? `/api/admin/inquiries/${id}` : null, open);
  const form = useForm({ status: "new", adminNote: "" });

  useEffect(() => {
    if (record) form.setValues({ status: record.status, adminNote: record.adminNote ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  const save = async () => {
    if (await form.submit((v) => api.patch(`/api/admin/inquiries/${id}`, v), "Inquiry updated.")) {
      onSaved?.();
      onClose();
    }
  };

  const replyHref = record
    ? `mailto:${record.email}?subject=${encodeURIComponent(`Re: ${record.subject} — Chef Patrick's Kitchen`)}&body=${encodeURIComponent(`Hi ${record.name.split(" ")[0]},\n\nThank you for reaching out to Chef Patrick's Kitchen.\n\n`)}`
    : "#";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Inquiry"
      size="lg"
      footer={
        <>
          {record && (
            <a href={replyHref} className="mr-auto inline-flex h-9 items-center gap-2 rounded-md border border-adm-border px-4 text-sm hover:border-adm-muted/50">
              <EnvelopeSimpleIcon size={16} /> Reply by email
            </a>
          )}
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={form.saving} disabled={!record}>Save</Button>
        </>
      }
    >
      {error ? (
        <p className="text-sm text-adm-red">{error}</p>
      ) : !record ? (
        <div className="grid place-items-center py-10"><Spinner /></div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold text-adm-text">{record.name}</p>
              <StatusBadge status={record.status} />
            </div>
            <p className="text-sm text-adm-muted">
              {record.email}
              {record.phone ? ` · ${record.phone}` : ""} · {shortDate(record.createdAt)}
            </p>
            <p className="text-sm font-medium text-adm-text">{record.subject}</p>
            <p className="rounded-md bg-adm-bg p-3 text-sm whitespace-pre-line text-adm-muted">{record.message}</p>
            {record.isDemo && <p className="text-xs text-adm-yellow">Sample record (demo data)</p>}
          </div>
          <div className="space-y-4">
            <Field label="Status">
              {(fid) => (
                <select id={fid} className={inputCls} value={form.values.status} onChange={(e) => form.set("status", e.target.value)}>
                  {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              )}
            </Field>
            <Field label="Admin note" hint="Only staff can see this.">
              {(fid) => <textarea id={fid} rows={6} className={inputCls} placeholder="What was answered, who is following up…" value={form.values.adminNote} onChange={(e) => form.set("adminNote", e.target.value)} />}
            </Field>
          </div>
        </div>
      )}
    </Modal>
  );
}
