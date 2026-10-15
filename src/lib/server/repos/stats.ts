// Dashboard numbers: statistic cards with period-over-period change, the revenue report, global
// search and the notification feed.
import { query } from "@/lib/server/mysql";
import type { RevenuePoint, StatCard } from "@/types/admin";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000) + 1;

const change = (now: number, before: number) => (before === 0 ? (now === 0 ? 0 : null) : Math.round(((now - before) / before) * 100));

/**
 * Totals for the cards, and the change in what was added during [from, to] compared with the
 * period of the same length just before it.
 */
export async function statCards(from: string, to: string): Promise<StatCard[]> {
  const span = daysBetween(from, to);
  const prevFrom = addDays(from, -span);
  const prevTo = addDays(from, -1);
  const added = async (table: string, extra = "") => {
    const [r] = await query<{ cur: number; prev: number; total: number }>(
      `SELECT
         SUM(DATE(created_at) BETWEEN ? AND ?) AS cur,
         SUM(DATE(created_at) BETWEEN ? AND ?) AS prev,
         COUNT(*) AS total
       FROM ${table} ${extra}`,
      [from, to, prevFrom, prevTo],
    );
    return { cur: Number(r.cur ?? 0), prev: Number(r.prev ?? 0), total: Number(r.total ?? 0) };
  };

  const [menu, reservations, packages, events, inquiries] = await Promise.all([
    added("menu_items"),
    added("reservations"),
    added("packages"),
    added("events", "WHERE event_date >= CURDATE() - INTERVAL 365 DAY"),
    added("inquiries", "WHERE status <> 'resolved'"),
  ]);
  const [pending] = await query<{ n: number }>("SELECT COUNT(*) AS n FROM inquiries WHERE status <> 'resolved'");

  return [
    { key: "menu", label: "Total Menu Items", value: menu.total, change: change(menu.cur, menu.prev) },
    { key: "reservations", label: "Total Reservations", value: reservations.total, change: change(reservations.cur, reservations.prev) },
    { key: "packages", label: "Catering Packages", value: packages.total, change: change(packages.cur, packages.prev) },
    { key: "events", label: "Total Events", value: events.total, change: change(events.cur, events.prev) },
    { key: "inquiries", label: "Pending Inquiries", value: Number(pending.n), change: change(inquiries.cur, inquiries.prev) },
  ];
}

/** Revenue from confirmed and completed events, by day (7d / 30d) or by month (12m). */
export async function revenue(range: "7d" | "30d" | "12m"): Promise<RevenuePoint[]> {
  const today = iso(new Date());
  if (range === "12m") {
    const rows = await query<{ ym: string; total: number }>(
      `SELECT DATE_FORMAT(event_date, '%Y-%m') AS ym, SUM(amount) AS total FROM events
       WHERE status IN ('confirmed','completed') AND event_date > DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND event_date <= CURDATE()
       GROUP BY ym`,
    );
    const byMonth = new Map(rows.map((r) => [r.ym, Number(r.total)]));
    const out: RevenuePoint[] = [];
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - 11);
    for (let i = 0; i < 12; i++) {
      const ym = d.toISOString().slice(0, 7);
      out.push({ date: `${ym}-01`, label: d.toLocaleDateString("en-PH", { month: "short", year: "2-digit", timeZone: "UTC" }), revenue: byMonth.get(ym) ?? 0 });
      d.setUTCMonth(d.getUTCMonth() + 1);
    }
    return out;
  }

  const days = range === "7d" ? 8 : 30;
  const start = addDays(today, -(days - 1));
  const rows = await query<{ d: string; total: number }>(
    `SELECT event_date AS d, SUM(amount) AS total FROM events
     WHERE status IN ('confirmed','completed') AND event_date BETWEEN ? AND ? GROUP BY event_date`,
    [start, today],
  );
  const byDay = new Map(rows.map((r) => [r.d, Number(r.total)]));
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(start, i);
    return { date, label: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: "UTC" }), revenue: byDay.get(date) ?? 0 };
  });
}

export interface SearchHit {
  type: "menu" | "reservation" | "event" | "inquiry";
  id: number;
  title: string;
  subtitle: string;
  href: string;
}

/** One query box for menu items, reservations, events and inquiries. */
export async function search(q: string): Promise<SearchHit[]> {
  const like = `%${q}%`;
  const [menu, res, ev, inq] = await Promise.all([
    query("SELECT i.id, i.name, c.name AS cat FROM menu_items i JOIN menu_categories c ON c.id = i.category_id WHERE i.name LIKE ? LIMIT 5", [like]),
    query("SELECT id, name, event_date, event_type FROM reservations WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY created_at DESC LIMIT 5", [like, like, like]),
    query("SELECT id, name, event_date, location FROM events WHERE name LIKE ? OR location LIKE ? ORDER BY event_date DESC LIMIT 5", [like, like]),
    query("SELECT id, name, subject FROM inquiries WHERE name LIKE ? OR email LIKE ? OR subject LIKE ? ORDER BY created_at DESC LIMIT 5", [like, like, like]),
  ]);
  return [
    ...menu.map((r) => ({ type: "menu" as const, id: r.id, title: r.name, subtitle: `Menu · ${r.cat}`, href: `/admin/menu?edit=${r.id}` })),
    ...res.map((r) => ({ type: "reservation" as const, id: r.id, title: r.name, subtitle: `Reservation · ${r.event_type} · ${r.event_date}`, href: `/admin/reservations?open=${r.id}` })),
    ...ev.map((r) => ({ type: "event" as const, id: r.id, title: r.name, subtitle: `Event · ${r.event_date} · ${r.location}`, href: `/admin/events?open=${r.id}` })),
    ...inq.map((r) => ({ type: "inquiry" as const, id: r.id, title: r.name, subtitle: `Inquiry · ${r.subject}`, href: `/admin/inquiries?open=${r.id}` })),
  ];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  href: string;
  at: string;
}

/** New reservations and inquiries, newest first. */
export async function notifications(): Promise<{ items: Notification[]; unread: number }> {
  const [res, inq] = await Promise.all([
    query("SELECT id, name, event_type, guests, created_at FROM reservations WHERE status = 'pending' ORDER BY created_at DESC LIMIT 6"),
    query("SELECT id, name, subject, created_at FROM inquiries WHERE status = 'new' ORDER BY created_at DESC LIMIT 6"),
  ]);
  const items: Notification[] = [
    ...res.map((r) => ({ id: `r${r.id}`, title: `Reservation from ${r.name}`, body: `${r.event_type} · ${r.guests} guests`, href: `/admin/reservations?open=${r.id}`, at: r.created_at })),
    ...inq.map((r) => ({ id: `i${r.id}`, title: `Inquiry from ${r.name}`, body: r.subject, href: `/admin/inquiries?open=${r.id}`, at: r.created_at })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return { items: items.slice(0, 8), unread: items.length };
}
