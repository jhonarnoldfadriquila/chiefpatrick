"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { prefersReducedMotion } from "@/lib/hooks";
import type { EventType } from "@/types";

export interface BookingPrefill {
  eventType?: EventType;
  message?: string;
  /** Changes on every request so the form re-applies the same prefill twice in a row. */
  nonce: number;
}

interface BookingContextValue {
  prefill: BookingPrefill | null;
  /** Prefills the reservation form and brings the customer to it. Used by every "Inquire / Reserve" CTA. */
  requestBooking: (prefill?: Omit<BookingPrefill, "nonce">) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [prefill, setPrefill] = useState<BookingPrefill | null>(null);

  const requestBooking = useCallback(
    (next: Omit<BookingPrefill, "nonce"> = {}) => {
      setPrefill({ ...next, nonce: Date.now() });
      // The provider lives in the site layout, so the prefill survives navigating to /contact,
      // where the form applies it on mount.
      const form = document.getElementById("contact");
      if (form) form.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      else router.push("/contact#contact");
    },
    [router],
  );

  const value = useMemo(() => ({ prefill, requestBooking }), [prefill, requestBooking]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
