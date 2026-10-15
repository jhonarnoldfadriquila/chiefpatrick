"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckCircleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { submitInquiry } from "@/lib/services/reservations";
import { cn } from "@/lib/format";

const input =
  "block h-14 w-full border-b border-line bg-transparent text-lg text-rice placeholder:text-muted/70 outline-none transition-colors focus:border-red-glow";

/** "Ask us anything": a short question that lands in the admin's Inquiries inbox. */
export function QuestionForm() {
  const [v, setV] = useState({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof v, value: string) => setV((x) => ({ ...x, [k]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    const res = await submitInquiry(v);
    if (res.ok) setStatus("sent");
    else {
      setStatus("error");
      setError(res.error);
      setErrors(res.fields ?? {});
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="py-6">
        <CheckCircleIcon size={44} weight="duotone" className="text-red-glow" />
        <p className="display mt-6 text-4xl">Thank you, {v.name.split(" ")[0]}.</p>
        <p className="mt-3 max-w-md text-muted">We received your question and will reply by email within a day.</p>
      </div>
    );
  }

  const field = (k: "name" | "email" | "phone" | "subject", label: string, type = "text", auto?: string) => (
    <label className="block">
      <span className="micro text-muted">{label}</span>
      <input type={type} autoComplete={auto} value={v[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} className={cn(input, "mt-1")} />
      {errors[k] && <span className="mt-1 block text-sm text-red-glow">{errors[k]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-7 sm:grid-cols-2">
      {field("name", "Name", "text", "name")}
      {field("email", "Email", "email", "email")}
      {field("phone", "Phone (optional)", "tel", "tel")}
      {field("subject", "Subject")}
      <label className="block sm:col-span-2">
        <span className="micro text-muted">Your question</span>
        <textarea rows={4} value={v.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message} className={cn(input, "mt-1 h-auto resize-none py-3")} />
        {errors.message && <span className="mt-1 block text-sm text-red-glow">{errors.message}</span>}
      </label>
      {/* Spam trap: hidden from people, filled in by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set("website", e.target.value)} className="hidden" aria-hidden />
      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="micro group inline-flex h-14 items-center gap-3 rounded-full bg-red px-8 text-rice transition-colors hover:bg-red-glow disabled:opacity-60" data-cursor="Send">
          {status === "sending" ? <CircleNotchIcon size={18} className="animate-spin" /> : null}
          {status === "sending" ? "Sending" : "Send question"}
          {status !== "sending" && <ArrowRightIcon size={18} weight="light" className="transition-transform duration-500 group-hover:translate-x-1" />}
        </button>
        {status === "error" && <p role="alert" className="text-red-glow">{error}</p>}
      </div>
    </form>
  );
}
