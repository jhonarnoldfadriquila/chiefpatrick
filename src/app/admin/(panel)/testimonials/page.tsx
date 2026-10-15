import type { Metadata } from "next";
import { TestimonialsPage } from "@/components/admin/pages/ContentPages";

export const metadata: Metadata = { title: "Testimonials" };

export default function Page() {
  return <TestimonialsPage />;
}
