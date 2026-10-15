import type { Metadata } from "next";
import { Suspense } from "react";
import { InquiriesPage } from "@/components/admin/pages/BookingPages";

export const metadata: Metadata = { title: "Inquiries" };

export default function Page() {
  return (
    <Suspense>
      <InquiriesPage />
    </Suspense>
  );
}
