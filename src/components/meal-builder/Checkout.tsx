"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { Choice, FieldError, inputClass } from "@/components/meal-builder/parts";
import { isRush, LEAD_DAYS, OCCASIONS, RUSH_FEE, THEME_COLOURS, type OrderLine } from "@/lib/data/meal-builder";
import { branches, siteConfig } from "@/lib/data/site";
import { cn, formatPeso } from "@/lib/format";
import { timeSlots, todayISO, validateField, type ReservationField } from "@/lib/validation/reservation";

const SLOTS = timeSlots();

export interface CheckoutResult {
  firstName: string;
  total: number;
  date: string;
  receive: string;
}

type Values = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  occasion: string;
  celebrant: string;
  theme: string;
  receive: "delivery" | "pickup";
  address: string;
  branch: string;
  rush: boolean;
  notes: string;
};

/** Step 4: one contact and event form for the whole order. */
export function Checkout({ lines, foodTotal, onBack, onDone }: { lines: OrderLine[]; foodTotal: number; onBack: () => void; onDone: (r: CheckoutResult) => void }) {
  const [v, setV] = useState<Values>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    occasion: "",
    celebrant: "",
    theme: "",
    receive: "delivery",
    address: "",
    branch: branches[0].id,
    rush: false,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [serverError, setServerError] = useState("");
  const [today, setToday] = useState("");
  useEffect(() => setToday(todayISO()), []);

  const rush = !!today && isRush(v.date, today);
  const total = foodTotal + (rush ? RUSH_FEE : 0);

  const set = <K extends keyof Values>(k: K, value: Values[K]) => {
    setV((x) => ({ ...x, [k]: value }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    for (const f of ["name", "email", "phone", "date", "time"] as ReservationField[]) {
      const err = validateField(f, v[f as keyof Values], { today });
      if (err) next[f] = err;
    }
    if (v.receive === "delivery" && v.address.trim().length < 8) next.address = "Please enter the full delivery address.";
    if (rush && !v.rush) next.rush = `Please accept the rush fee, or pick a date at least ${LEAD_DAYS} days away.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/meal-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, lines }),
      });
      const body = (await res.json().catch(() => null)) as { ok: boolean; data?: { total: number }; error?: string; fields?: Record<string, string> } | null;
      if (body?.ok) {
        onDone({ firstName: v.name.trim().split(/\s+/)[0], total: body.data?.total ?? total, date: v.date, receive: v.receive === "delivery" ? `Delivery to ${v.address}` : `Pick up at ${branches.find((b) => b.id === v.branch)?.name}` });
        return;
      }
      if (body?.fields) setErrors(body.fields);
      setServerError(body?.error ?? `Unexpected server response (${res.status}).`);
    } catch {
      setServerError(`We couldn't reach the server. Please try again or call ${siteConfig.contact.phone}.`);
    }
    setStatus("idle");
  };

  const field = (k: keyof Values) => ({ "aria-invalid": !!errors[k], "aria-describedby": `err-${k}` });

  return (
    <form onSubmit={submit} noValidate aria-label="Your details" className="grid gap-14 lg:grid-cols-12">
      <div className="space-y-14 lg:col-span-8">
        <fieldset className="grid gap-8 sm:grid-cols-2">
          <legend className="micro mb-2 text-muted">(a) Contact</legend>
          <label className="block sm:col-span-2">
            <span className="micro text-muted">Full name</span>
            <input autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} {...field("name")} className={cn(inputClass, "mt-2")} />
            <FieldError id="err-name" error={errors.name} />
          </label>
          <label className="block">
            <span className="micro text-muted">Email</span>
            <input type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} {...field("email")} className={cn(inputClass, "mt-2")} />
            <FieldError id="err-email" error={errors.email} />
          </label>
          <label className="block">
            <span className="micro text-muted">Mobile number</span>
            <input type="tel" autoComplete="tel" placeholder="0917 123 4567" value={v.phone} onChange={(e) => set("phone", e.target.value)} {...field("phone")} className={cn(inputClass, "mt-2")} />
            <FieldError id="err-phone" error={errors.phone} />
          </label>
        </fieldset>

        <fieldset className="grid gap-8 sm:grid-cols-2">
          <legend className="micro mb-2 text-muted">(b) The event</legend>
          <label className="block">
            <span className="micro text-muted">Event date</span>
            <input type="date" min={today} value={v.date} onChange={(e) => set("date", e.target.value)} {...field("date")} className={cn(inputClass, "mt-2")} />
            <FieldError id="err-date" error={errors.date} />
          </label>
          <label className="block">
            <span className="micro text-muted">{v.receive === "delivery" ? "Deliver by" : "Pick up at"}</span>
            <select value={v.time} onChange={(e) => set("time", e.target.value)} {...field("time")} className={cn(inputClass, "mt-2 bg-ink")}>
              <option value="">Select a time</option>
              {SLOTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <FieldError id="err-time" error={errors.time} />
          </label>

          {rush && (
            <div className="sm:col-span-2">
              <label className={cn("flex cursor-pointer items-start gap-4 border p-5 transition-colors", v.rush ? "border-gold" : errors.rush ? "border-red-glow" : "border-line")}>
                <input type="checkbox" checked={v.rush} onChange={(e) => set("rush", e.target.checked)} aria-describedby="err-rush" className="mt-1 size-5 accent-[var(--color-red)]" />
                <span>
                  <span className="block text-lg">Rush order · +{formatPeso(RUSH_FEE)}</span>
                  <span className="block text-sm text-muted">
                    We usually need {LEAD_DAYS} days. For a sooner date we&rsquo;ll move your order to the front of the kitchen.
                  </span>
                </span>
              </label>
              <FieldError id="err-rush" error={errors.rush} />
            </div>
          )}

          <div className="sm:col-span-2">
            <p className="micro text-muted">Occasion</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <Choice key={o} active={v.occasion === o} onClick={() => set("occasion", v.occasion === o ? "" : o)} className="rounded-full px-4 py-2 text-sm">
                  {o}
                </Choice>
              ))}
            </div>
          </div>
          <label className="block sm:col-span-2">
            <span className="micro text-muted">Celebrant&rsquo;s name (optional)</span>
            <input value={v.celebrant} onChange={(e) => set("celebrant", e.target.value)} className={cn(inputClass, "mt-2")} />
          </label>
          <div className="sm:col-span-2">
            <p className="micro text-muted">Theme colour (optional)</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {THEME_COLOURS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  aria-pressed={v.theme === c.name}
                  onClick={() => set("theme", v.theme === c.name ? "" : c.name)}
                  className={cn("inline-flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm transition-colors", v.theme === c.name ? "border-rice" : "border-line hover:border-muted")}
                >
                  <span aria-hidden className="size-6 rounded-full border border-rice/20" style={{ background: c.hex }} />
                  {c.name}
                </button>
              ))}
            </div>
            <input
              aria-label="Or type a theme colour"
              placeholder="Or type it, e.g. sage green and white"
              value={THEME_COLOURS.some((c) => c.name === v.theme) ? "" : v.theme}
              onChange={(e) => set("theme", e.target.value)}
              className={cn(inputClass, "mt-4 h-12 text-base")}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="micro mb-4 text-muted">(c) Getting the food to you</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <Choice active={v.receive === "delivery"} onClick={() => set("receive", "delivery")} className="px-5 py-4">
              <span className="block text-lg">Delivery</span>
              <span className={cn("block text-sm", v.receive === "delivery" ? "text-rice/80" : "text-muted")}>Fee quoted with your confirmation</span>
            </Choice>
            <Choice active={v.receive === "pickup"} onClick={() => set("receive", "pickup")} className="px-5 py-4">
              <span className="block text-lg">Pick up</span>
              <span className={cn("block text-sm", v.receive === "pickup" ? "text-rice/80" : "text-muted")}>From Caloocan or Tondo</span>
            </Choice>
          </div>
          {v.receive === "delivery" ? (
            <label className="mt-8 block">
              <span className="micro text-muted">Delivery address</span>
              <input autoComplete="street-address" value={v.address} onChange={(e) => set("address", e.target.value)} {...field("address")} className={cn(inputClass, "mt-2")} />
              <FieldError id="err-address" error={errors.address} />
            </label>
          ) : (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {branches.map((b) => (
                <Choice key={b.id} active={v.branch === b.id} onClick={() => set("branch", b.id)} className="px-5 py-4">
                  <span className="block text-lg">{b.name}</span>
                  <span className={cn("block text-sm", v.branch === b.id ? "text-rice/80" : "text-muted")}>{b.address}</span>
                </Choice>
              ))}
            </div>
          )}
        </fieldset>

        <label className="block">
          <span className="micro text-muted">Anything else? (optional)</span>
          <textarea
            rows={3}
            value={v.notes}
            maxLength={1000}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Allergies, venue access, serving utensils…"
            className="mt-2 block w-full resize-none border-b border-line bg-transparent py-3 text-lg text-rice outline-none placeholder:text-muted/70 focus:border-red-glow"
          />
        </label>
      </div>

      <aside className="lg:col-span-4">
        <div className="border border-line bg-charcoal p-6 lg:sticky lg:top-28">
          <p className="micro text-muted">Order total</p>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Food</dt>
              <dd className="tabular-nums">{formatPeso(foodTotal)}</dd>
            </div>
            {rush && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Rush order</dt>
                <dd className="tabular-nums">{formatPeso(RUSH_FEE)}</dd>
              </div>
            )}
            {v.receive === "delivery" && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Delivery</dt>
                <dd>Quoted later</dd>
              </div>
            )}
          </dl>
          <p className="display mt-6 border-t border-line pt-6 text-5xl tabular-nums">{formatPeso(total)}</p>
          <p className="mt-3 text-sm text-muted">An estimate. We confirm the final quote before you pay anything.</p>
          {serverError && (
            <p role="alert" className="mt-5 text-sm text-red-glow">
              {serverError}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="micro mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-red text-rice transition-colors hover:bg-red-glow disabled:opacity-60"
          >
            {status === "sending" ? <CircleNotchIcon size={18} className="animate-spin" /> : null}
            {status === "sending" ? "Sending" : "Send my order"}
            {status !== "sending" && <ArrowRightIcon size={18} />}
          </button>
          <button type="button" onClick={onBack} className="micro mt-4 inline-flex w-full items-center justify-center gap-2 text-muted transition-colors hover:text-rice">
            <ArrowLeftIcon size={16} /> Back to my order
          </button>
        </div>
      </aside>
    </form>
  );
}
