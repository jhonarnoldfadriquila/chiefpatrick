import type { Metadata } from "next";
import { Suspense } from "react";
import { PackagesPage } from "@/components/admin/pages/ContentPages";

export const metadata: Metadata = { title: "Catering Packages" };

export default function Page() {
  return (
    <Suspense>
      <PackagesPage />
    </Suspense>
  );
}
