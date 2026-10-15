import { route } from "@/lib/server/http";
import { listReservations } from "@/lib/server/repos/bookings";

// Quote every cell, and defuse anything a spreadsheet would run as a formula (CSV injection).
const cell = (value: unknown) => {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

/** All reservations matching ?status=&q= as a CSV file for Excel or Google Sheets. */
export const GET = route(
  async ({ req }) => {
    const url = new URL(req.url);
    const { items } = await listReservations({
      status: url.searchParams.get("status") ?? undefined,
      q: url.searchParams.get("q")?.trim() || undefined,
      limit: 10000,
      offset: 0,
      orderBy: "created_at DESC",
    });
    const header = ["Received", "Status", "Name", "Phone", "Email", "Event", "Date", "Time", "Guests", "Message", "Notes"];
    const rows = items.map((r) => [r.createdAt, r.status, r.name, r.phone, r.email, r.eventType, r.date, r.time, r.guests, r.message, r.notes].map(cell).join(","));
    return new Response("﻿" + [header.map(cell).join(","), ...rows].join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="cpk-reservations-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  },
  { auth: "staff" },
);
