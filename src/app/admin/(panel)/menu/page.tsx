import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuPage } from "@/components/admin/pages/MenuPage";

export const metadata: Metadata = { title: "Menu Management" };

export default function Page() {
  return (
    <Suspense>
      <MenuPage />
    </Suspense>
  );
}
