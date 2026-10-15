"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { useBooking } from "@/components/providers/BookingProvider";
import { gsap, prefersFullMotion } from "@/lib/motion";
import { siteConfig } from "@/lib/data/site";
import { cn, formatPeso } from "@/lib/format";
import { submitReservation } from "@/lib/services/reservations";
import {
  MAX_GUESTS,
  timeSlots,
  todayISO,
  validateField,
  validateReservation,
  type ReservationErrors,
  type ReservationField,
} from "@/lib/validation/reservation";
import { EVENT_TYPES, type CateringPackage, type ReservationInput } from "@/types";

const STEPS = ["Occasion", "Date", "Guests", "Package", "Details"] as const;
const SLOTS = timeSlots();
const OCCASIONS = EVENT_TYPES.filter((t) => t.value !== "catering");
const GUEST_PRESETS = [50, 100, 150, 200, 300, 500];

// Which fields each step must pass before moving on.
const STEP_FIELDS: ReservationField[][] = [["eventType"], ["date", "time"], ["guests"], [], ["name", "email", "phone", "message"]];

const input =
  "block h-14 w-full border-b border-line bg-transparent text-xl text-rice placeholder:text-muted/70 outline-none transition-colors focus:border-red-glow";

function ErrorText({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={id} role="alert" className="mt-2 text-sm text-red-glow">
      {error}
    </p>
  ) : null;
}

/** Contact page: a five-step event inquiry (occasion → date → guests → package → details). */
export function InquiryForm({ packages: cateringPackages }: { packages: CateringPackage[] }) {
  const PACKAGES = [...cateringPackages.map((p) => `${p.name} · ${formatPeso(p.price)}`), "Not sure yet"];
  const { prefill } = useBooking();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ eventType: "", date: "", time: "", guests: "", pkg: "", name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<ReservationErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [result, setResult] = useState<{ reservation: ReservationInput; persisted: boolean } | null>(null);
  const [serverError, setServerError] = useState("");
  const [today, setToday] = useState<string>();
  const panel = useRef<HTMLDivElement>(null);
  const direction = useRef(1);

  useEffect(() => setToday(todayISO()), []);

  // Prefills from "Ask about…" buttons elsewhere on the site.
  useEffect(() => {
    if (!prefill) return;
    setValues((v) => ({
      ...v,
      eventType: prefill.eventType && prefill.eventType !== "catering" ? prefill.eventType : v.eventType,
      message: prefill.message ?? v.message,
      pkg: cateringPackages.find((p) => prefill.message?.includes(p.name)) ? PACKAGES[cateringPackages.findIndex((p) => prefill.message?.includes(p.name))] : v.pkg,
    }));
  }, [prefill]);

  // Step transition: the new panel slides in from the side it came from.
  useLayoutEffect(() => {
    if (!panel.current) return;
    if (!prefersFullMotion()) {
      gsap.fromTo(panel.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      return;
    }
    gsap.fromTo(
      panel.current.children,
      { xPercent: 8 * direction.current, opacity: 0 },
      { xPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "expo.out" },
    );
    panel.current.querySelector<HTMLElement>("input, button[data-choice], textarea")?.focus({ preventScroll: true });
  }, [step, result]);

  const set = (field: keyof typeof values, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (field in errors) setErrors((e) => ({ ...e, [field]: validateField(field as ReservationField, value, { today }) }));
  };

  const checkStep = (s: number) => {
    const next: ReservationErrors = {};
    for (const f of STEP_FIELDS[s]) {
      const err = validateField(f, values[f as keyof typeof values], { today });
      if (err) next[f] = err;
    }
    setErrors((e) => ({ ...e, ...next, ...Object.fromEntries(STEP_FIELDS[s].filter((f) => !next[f]).map((f) => [f, undefined])) }));
    return Object.keys(next).length === 0;
  };

  const go = (to: number) => {
    if (to > step && !checkStep(step)) return;
    direction.current = to > step ? 1 : -1;
    setStep(to);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return go(step + 1);
    if (!checkStep(step)) return;
    const message = [values.pkg && values.pkg !== "Not sure yet" ? `Package: ${values.pkg}.` : "", values.message].filter(Boolean).join(" ");
    const parsed = validateReservation({ ...values, message }, { today: today ?? todayISO() });
    if (!parsed.success) {
      setErrors(parsed.errors);
      const firstBad = STEP_FIELDS.findIndex((fs) => fs.some((f) => parsed.errors[f]));
      if (firstBad >= 0) go(firstBad);
      return;
    }
    setStatus("sending");
    const res = await submitReservation(parsed.data);
    if (res.ok) {
      setResult({ reservation: res.reservation, persisted: res.persisted });
      setStatus("idle");
    } else {
      setServerError(res.error);
      if (res.errors) setErrors(res.errors);
      setStatus("error");
    }
  };

  if (result) {
    const r = result.reservation;
    return (
      <div ref={panel} role="status" aria-live="polite" className="py-10">
        <CheckCircleIcon size={56} weight="duotone" className="text-red-glow" />
        <p className="display mt-8 text-[clamp(3rem,7vw,6rem)]">
          Salamat, <em className="italic-wonk text-red-glow">{r.name.split(" ")[0]}</em>
        </p>
        <p className="mt-6 max-w-xl text-lg text-muted">
          {r.guests} guests on {new Date(`${r.date}T00:00:00`).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}.{" "}
          {result.persisted
            ? "We will call or email to confirm within a day."
            : `Online booking isn't connected yet, so this request was not sent. Please call ${siteConfig.contact.phone} to book.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Event inquiry" className="grid gap-12 lg:grid-cols-12">
      {/* Progress */}
      <ol className="flex gap-2 lg:col-span-3 lg:flex-col lg:gap-4">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1 lg:flex-none">
            <button
              type="button"
              onClick={() => (i < step ? go(i) : undefined)}
              disabled={i > step}
              aria-current={i === step ? "step" : undefined}
              className={cn("micro w-full border-t pt-3 text-left transition-colors", i <= step ? "border-red-glow text-rice" : "border-line text-muted")}
            >
              <span className="hidden sm:inline">({String(i + 1).padStart(2, "0")}) </span>
              {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="lg:col-span-8 lg:col-start-5">
        <p className="micro text-muted">
          Step {String(step + 1).padStart(2, "0")}/{String(STEPS.length).padStart(2, "0")}
        </p>
        <div ref={panel} className="mt-6 min-h-[22rem]">
          {step === 0 && (
            <fieldset>
              <legend className="display text-[clamp(2.5rem,5vw,4.5rem)]">
                What are we <em className="italic-wonk text-red-glow">celebrating?</em>
              </legend>
              <div className="mt-10 grid gap-2 sm:grid-cols-2">
                {OCCASIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    data-choice
                    aria-pressed={values.eventType === o.value}
                    onClick={() => {
                      set("eventType", o.value);
                      setErrors((e) => ({ ...e, eventType: undefined }));
                    }}
                    className={cn(
                      "flex h-16 items-center justify-between border px-5 text-left text-lg transition-colors duration-300",
                      values.eventType === o.value ? "border-red bg-red text-rice" : "border-line hover:border-rice",
                    )}
                  >
                    {o.label}
                    <span aria-hidden className={cn("size-2.5 rounded-full", values.eventType === o.value ? "bg-rice" : "bg-line")} />
                  </button>
                ))}
              </div>
              <ErrorText id="err-eventType" error={errors.eventType} />
            </fieldset>
          )}

          {step === 1 && (
            <fieldset>
              <legend className="display text-[clamp(2.5rem,5vw,4.5rem)]">
                When is the <em className="italic-wonk text-red-glow">day?</em>
              </legend>
              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <label className="block">
                  <span className="micro text-muted">Date</span>
                  <input type="date" min={today} value={values.date} onChange={(e) => set("date", e.target.value)} aria-invalid={!!errors.date} aria-describedby="err-date" className={cn(input, "mt-2")} />
                  <ErrorText id="err-date" error={errors.date} />
                </label>
                <label className="block">
                  <span className="micro text-muted">Time</span>
                  <select value={values.time} onChange={(e) => set("time", e.target.value)} aria-invalid={!!errors.time} aria-describedby="err-time" className={cn(input, "mt-2 bg-ink")}>
                    <option value="">Select a time</option>
                    {SLOTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ErrorText id="err-time" error={errors.time} />
                </label>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset>
              <legend className="display text-[clamp(2.5rem,5vw,4.5rem)]">
                How many <em className="italic-wonk text-red-glow">guests?</em>
              </legend>
              <div className="mt-10 flex flex-wrap gap-2">
                {GUEST_PRESETS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    data-choice
                    aria-pressed={values.guests === String(g)}
                    onClick={() => set("guests", String(g))}
                    className={cn(
                      "h-12 min-w-20 rounded-full border px-5 tabular-nums transition-colors",
                      values.guests === String(g) ? "border-red bg-red" : "border-line hover:border-rice",
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <label className="mt-8 block max-w-xs">
                <span className="micro text-muted">Or type the number</span>
                <input type="number" inputMode="numeric" min={1} max={MAX_GUESTS} value={values.guests} onChange={(e) => set("guests", e.target.value)} aria-invalid={!!errors.guests} aria-describedby="err-guests" className={cn(input, "mt-2 tabular-nums")} placeholder="e.g. 120" />
                <ErrorText id="err-guests" error={errors.guests} />
              </label>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset>
              <legend className="display text-[clamp(2.5rem,5vw,4.5rem)]">
                Pick a <em className="italic-wonk text-red-glow">package</em>
              </legend>
              <div className="mt-10 grid gap-2">
                {PACKAGES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    data-choice
                    aria-pressed={values.pkg === p}
                    onClick={() => set("pkg", p)}
                    className={cn(
                      "flex h-16 items-center justify-between border px-5 text-left text-lg transition-colors",
                      values.pkg === p ? "border-red bg-red" : "border-line hover:border-rice",
                    )}
                  >
                    {p}
                    <span aria-hidden className={cn("size-2.5 rounded-full", values.pkg === p ? "bg-rice" : "bg-line")} />
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted">Optional. Rates are a guide; we quote by menu, venue and date.</p>
            </fieldset>
          )}

          {step === 4 && (
            <fieldset>
              <legend className="display text-[clamp(2.5rem,5vw,4.5rem)]">
                Who should we <em className="italic-wonk text-red-glow">call?</em>
              </legend>
              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                {([
                  ["name", "Full name", "text", "name"],
                  ["phone", "Phone", "tel", "tel"],
                  ["email", "Email", "email", "email"],
                ] as const).map(([f, label, type, ac]) => (
                  <label key={f} className={cn("block", f === "email" && "sm:col-span-2")}>
                    <span className="micro text-muted">{label}</span>
                    <input type={type} autoComplete={ac} value={values[f]} onChange={(e) => set(f, e.target.value)} aria-invalid={!!errors[f]} aria-describedby={`err-${f}`} className={cn(input, "mt-2")} />
                    <ErrorText id={`err-${f}`} error={errors[f]} />
                  </label>
                ))}
                <label className="block sm:col-span-2">
                  <span className="micro text-muted">Anything else (optional)</span>
                  <textarea rows={3} value={values.message} onChange={(e) => set("message", e.target.value)} aria-describedby="err-message" className={cn(input, "mt-2 h-auto resize-none py-3")} placeholder="The venue, the dishes you love, the colours of the day" />
                  <ErrorText id="err-message" error={errors.message} />
                </label>
              </div>
            </fieldset>
          )}
        </div>

        {status === "error" && (
          <p role="alert" className="mt-6 text-red-glow">
            {serverError}
          </p>
        )}

        <div className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-6">
          <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="micro inline-flex h-12 items-center gap-2 disabled:opacity-30">
            <ArrowLeftIcon size={18} weight="light" /> Back
          </button>
          <button
            type="submit"
            disabled={status === "sending"}
            data-cursor={step === STEPS.length - 1 ? "Send" : "Next"}
            className="micro group inline-flex h-14 items-center gap-3 rounded-full bg-red px-8 text-rice transition-colors duration-500 hover:bg-red-glow disabled:opacity-60"
          >
            {status === "sending" ? <CircleNotchIcon size={18} className="animate-spin" /> : null}
            {step === STEPS.length - 1 ? (status === "sending" ? "Sending" : "Send inquiry") : "Next"}
            {status !== "sending" && <ArrowRightIcon size={18} weight="light" className="transition-transform duration-500 group-hover:translate-x-1" />}
          </button>
        </div>
      </div>
    </form>
  );
}
