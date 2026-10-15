import { ok, route } from "@/lib/server/http";
import { search } from "@/lib/server/repos/stats";

/** Searches menu items, reservations, events and inquiries. ?q= (at least 2 characters) */
export const GET = route(
  async ({ req }) => {
    const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 80);
    return ok(q.length < 2 ? [] : await search(q));
  },
  { auth: "staff" },
);
