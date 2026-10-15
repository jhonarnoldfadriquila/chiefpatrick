import type { Metadata } from "next";
import { GalleryPage } from "@/components/admin/pages/ContentPages";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return <GalleryPage />;
}
