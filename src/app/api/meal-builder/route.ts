import { getMealCatalog } from "@/lib/content";
import { isRush, OCCASIONS, priceLine, RUSH_FEE, type OrderLine, type PricedLine } from "@/lib/data/meal-builder";
import { branches } from "@/lib/data/site";
import { formatPeso } from "@/lib/format";
import { clientIp, rateLimit } from "@/lib/server/auth";
import { ApiError, fail, ok, readJson, route } from "@/lib/server/http";
import { createReservation } from "@/lib/server/repos/bookings";
import { validateField, type ReservationField } from "@/lib/validation/reservation";

/** Today's date in Manila, where the kitchen is (YYYY-MM-DD). */
const manilaToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Public meal builder checkout. Re-prices every line from the catalogue (the client's totals are
 * never trusted), then saves the order as a pending catering reservation for staff in the admin.
 */
export const POST = route(async ({ req }) => {
  if (!rateLimit(`meal:${await clientIp()}`, 10, 60 * 60_000)) {
    throw new ApiError(429, "Too many requests from this connection. Please call us instead.");
  }
  const body = await readJson(req);
  const today = manilaToday();

  const fields: Record<string, string> = {};
  for (const f of ["name", "email", "phone", "date", "time"] as ReservationField[]) {
    const err = validateField(f, body[f], { today });
    if (err) fields[f] = err;
  }
  const receive = body.receive === "pickup" ? "pickup" : "delivery";
  const address = text(body.address, 300);
  const branch = branches.find((b) => b.id === body.branch);
  if (receive === "delivery" && address.length < 8) fields.address = "Please enter the full delivery address.";
  if (receive === "pickup" && !branch) fields.branch = "Choose the branch you'll pick up from.";
  const date = text(body.date, 10);
  const rush = isRush(date, today);
  if (rush && body.rush !== true) fields.rush = `Orders less than 3 days away are rush orders (+${formatPeso(RUSH_FEE)}). Please accept the fee or pick a later date.`;
  if (Object.keys(fields).length) return fail(422, "Please check the highlighted fields.", fields);

  const rawLines = Array.isArray(body.lines) ? (body.lines as OrderLine[]).slice(0, 60) : [];
  if (!rawLines.length) return fail(422, "Your order is empty.");
  const catalog = await getMealCatalog();
  const priced: PricedLine[] = [];
  for (const line of rawLines) {
    const p = priceLine(line, catalog);
    if ("error" in p) return fail(422, p.error);
    priced.push(p);
  }

  const food = priced.reduce((n, l) => n + l.total, 0);
  const total = food + (rush ? RUSH_FEE : 0);
  const guests = priced.reduce((n, l) => n + l.pax, 0);
  const occasion = OCCASIONS.includes(text(body.occasion, 40)) ? text(body.occasion, 40) : "";

  const message = [
    "MEAL BUILDER ORDER",
    ...priced.map((l) => `• ${l.title} — ${formatPeso(l.total)}\n   ${l.details.join(" · ")}`),
    rush ? `• Rush order fee — ${formatPeso(RUSH_FEE)}` : "",
    `Estimated total: ${formatPeso(total)}`,
    "",
    receive === "delivery" ? `Delivery to: ${address}` : `Pick up at: ${branch!.name}`,
    occasion && `Occasion: ${occasion}`,
    text(body.celebrant, 80) && `Celebrant: ${text(body.celebrant, 80)}`,
    text(body.theme, 60) && `Theme colour: ${text(body.theme, 60)}`,
    text(body.notes, 1000) && `Notes: ${text(body.notes, 1000)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const reservation = {
    name: text(body.name, 80),
    email: text(body.email, 190).toLowerCase(),
    phone: text(body.phone, 40),
    date,
    time: text(body.time, 5),
    guests,
    eventType: "catering",
    message,
  };
  try {
    await createReservation(reservation);
  } catch (err) {
    console.error("[meal-builder] could not save", err);
    return fail(503, "We couldn't save your order just now. Please call us instead.");
  }
  return ok({ total, guests, rush });
});
