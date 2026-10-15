import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsPage } from "@/components/admin/pages/BookingPages";

export const metadata: Metadata = { title: "Events" };

export default function Page() {
  return (
    <Suspense>
      <EventsPage />
    </Suspense>
  );
}
