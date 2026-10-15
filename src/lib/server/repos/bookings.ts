// Reservations, events and inquiries.
import { exec, query, queryOne, type Row } from "@/lib/server/db";
import { setClause, toBool, toNum } from "@/lib/server/repos/common";
import type { EventRecord, InquiryRecord, ReservationRecord } from "@/types/admin";

// ---------- reservations ----------

const mapReservation = (r: Row): ReservationRecord => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  date: r.event_date,
  time: r.event_time,
  guests: Number(r.guests),
  eventType: r.event_type,
  message: r.message,
  status: r.status,
  notes: r.notes,
  isDemo: toBool(r.is_demo),
  createdAt: r.created_at,
});

interface ListOpts {
  status?: string;
  q?: string;
  from?: string | null;
  to?: string | null;
  limit: number;
  offset: number;
  orderBy: string;
}

function filters(opts: ListOpts, searchCols: string[], dateCol: string) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.status && opts.status !== "all") {
    where.push("status = ?");
    params.push(opts.status);
  }
  if (opts.q) {
    where.push(`(${searchCols.map((c) => `${c} ILIKE ?`).join(" OR ")})`);
    params.push(...searchCols.map(() => `%${opts.q}%`));
  }
  if (opts.from) {
    where.push(`${dateCol} >= ?`);
    params.push(opts.from);
  }
  if (opts.to) {
    where.push(`${dateCol} <= ?`);
    params.push(opts.to);
  }
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

export async function listReservations(opts: ListOpts) {
  const f = filters(opts, ["name", "email", "phone", "message"], "event_date");
  const rows = await query(`SELECT * FROM reservations ${f.sql} ORDER BY ${opts.orderBy} LIMIT ? OFFSET ?`, [...f.params, opts.limit, opts.offset]);
  const [c] = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM reservations ${f.sql}`, f.params);
  return { items: rows.map(mapReservation), total: Number(c.n) };
}

export async function getReservation(id: number) {
  const r = await queryOne("SELECT * FROM reservations WHERE id = ?", [id]);
  return r ? mapReservation(r) : null;
}

export async function createReservation(d: { name: string; email: string; phone: string; date: string; time: string; guests: number; eventType: string; message?: string | null }) {
  const r = await exec(
    "INSERT INTO reservations (name, email, phone, event_date, event_time, guests, event_type, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [d.name, d.email, d.phone, d.date, d.time, d.guests, d.eventType, d.message || null],
  );
  return r.insertId;
}

export async function updateReservation(id: number, d: Partial<ReservationRecord>) {
  const { sql, params } = setClause(d, {
    name: "name", email: "email", phone: "phone", date: "event_date", time: "event_time", guests: "guests",
    eventType: "event_type", message: "message", status: "status", notes: "notes",
  });
  if (sql) await exec(`UPDATE reservations SET ${sql} WHERE id = ?`, [...params, id]);
}

export const deleteReservation = (id: number) => exec("DELETE FROM reservations WHERE id = ?", [id]);

// ---------- events ----------

const mapEvent = (r: Row): EventRecord => ({
  id: r.id,
  name: r.name,
  eventType: r.event_type,
  date: r.event_date,
  time: r.event_time,
  location: r.location,
  guests: Number(r.guests),
  amount: Number(r.amount),
  status: r.status,
  notes: r.notes,
  reservationId: toNum(r.reservation_id),
  isDemo: toBool(r.is_demo),
  createdAt: r.created_at,
});

export async function listEvents(opts: ListOpts) {
  const f = filters(opts, ["name", "location", "notes"], "event_date");
  const rows = await query(`SELECT * FROM events ${f.sql} ORDER BY ${opts.orderBy} LIMIT ? OFFSET ?`, [...f.params, opts.limit, opts.offset]);
  const [c] = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM events ${f.sql}`, f.params);
  return { items: rows.map(mapEvent), total: Number(c.n) };
}

export async function getEvent(id: number) {
  const r = await queryOne("SELECT * FROM events WHERE id = ?", [id]);
  return r ? mapEvent(r) : null;
}

const EVENT_COLUMNS = {
  name: "name", eventType: "event_type", date: "event_date", time: "event_time", location: "location",
  guests: "guests", amount: "amount", status: "status", notes: "notes", reservationId: "reservation_id",
};

export async function createEvent(d: Partial<EventRecord> & { name: string; eventType: string; date: string }) {
  const r = await exec(
    "INSERT INTO events (name, event_type, event_date, event_time, location, guests, amount, status, notes, reservation_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [d.name, d.eventType, d.date, d.time ?? null, d.location ?? "", d.guests ?? 0, d.amount ?? 0, d.status ?? "pending", d.notes ?? null, d.reservationId ?? null],
  );
  return r.insertId;
}

export async function updateEvent(id: number, d: Partial<EventRecord>) {
  const { sql, params } = setClause(d, EVENT_COLUMNS);
  if (sql) await exec(`UPDATE events SET ${sql} WHERE id = ?`, [...params, id]);
}

export const deleteEvent = (id: number) => exec("DELETE FROM events WHERE id = ?", [id]);

// ---------- inquiries ----------

const mapInquiry = (r: Row): InquiryRecord => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  subject: r.subject,
  message: r.message,
  status: r.status,
  adminNote: r.admin_note,
  isDemo: toBool(r.is_demo),
  createdAt: r.created_at,
});

export async function listInquiries(opts: ListOpts) {
  const f = filters(opts, ["name", "email", "subject", "message"], "DATE(created_at)");
  const rows = await query(`SELECT * FROM inquiries ${f.sql} ORDER BY ${opts.orderBy} LIMIT ? OFFSET ?`, [...f.params, opts.limit, opts.offset]);
  const [c] = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM inquiries ${f.sql}`, f.params);
  return { items: rows.map(mapInquiry), total: Number(c.n) };
}

export async function getInquiry(id: number) {
  const r = await queryOne("SELECT * FROM inquiries WHERE id = ?", [id]);
  return r ? mapInquiry(r) : null;
}

export async function createInquiry(d: { name: string; email: string; phone?: string | null; subject: string; message: string }) {
  const r = await exec("INSERT INTO inquiries (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)", [d.name, d.email, d.phone || null, d.subject, d.message]);
  return r.insertId;
}

export async function updateInquiry(id: number, d: Partial<InquiryRecord>) {
  const { sql, params } = setClause(d, { status: "status", adminNote: "admin_note" });
  if (sql) await exec(`UPDATE inquiries SET ${sql} WHERE id = ?`, [...params, id]);
}

export const deleteInquiry = (id: number) => exec("DELETE FROM inquiries WHERE id = ?", [id]);
