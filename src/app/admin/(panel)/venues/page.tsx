import type { Metadata } from "next";
import { VenuesPage } from "@/components/admin/pages/ContentPages";

export const metadata: Metadata = { title: "Venues" };

export default function Page() {
  return <VenuesPage />;
}
