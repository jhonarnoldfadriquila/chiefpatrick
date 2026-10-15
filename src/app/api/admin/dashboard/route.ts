import { ok, route } from "@/lib/server/http";
import { listEvents, listInquiries, listReservations } from "@/lib/server/repos/bookings";
import { getSettings, listGallery } from "@/lib/server/repos/content";
import { popularItems } from "@/lib/server/repos/menu";
import { statCards } from "@/lib/server/repos/stats";

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Everything the dashboard shows, in one request. ?from=YYYY-MM-DD&to=YYYY-MM-DD (default: last 30 days). */
export const GET = route(
  async ({ req }) => {
    const url = new URL(req.url);
    const to = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get("to") ?? "") ? url.searchParams.get("to")! : iso(new Date());
    const fromDefault = new Date(`${to}T00:00:00Z`);
    fromDefault.setUTCDate(fromDefault.getUTCDate() - 29);
    const fromParam = url.searchParams.get("from") ?? "";
    const from = /^\d{4}-\d{2}-\d{2}$/.test(fromParam) && fromParam <= to ? fromParam : iso(fromDefault);

    const [cards, reservations, inquiries, events, popular, gallery, settings] = await Promise.all([
      statCards(from, to),
      listReservations({ limit: 5, offset: 0, orderBy: "created_at DESC" }),
      listInquiries({ limit: 5, offset: 0, orderBy: "created_at DESC" }),
      listEvents({ from: iso(new Date()), limit: 4, offset: 0, orderBy: "event_date ASC" }),
      popularItems(5),
      listGallery(),
      getSettings(),
    ]);

    return ok({
      range: { from, to },
      cards,
      recentReservations: reservations.items,
      recentInquiries: inquiries.items,
      latestEvents: events.items,
      popularItems: popular,
      gallery: gallery.slice(0, 4),
      galleryCount: gallery.length,
      settings,
    });
  },
  { auth: "staff" },
);
