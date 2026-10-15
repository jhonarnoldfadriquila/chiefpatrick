import type { Metadata } from "next";
import { SettingsPage } from "@/components/admin/pages/SettingsPage";
import { requireUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Website Settings" };

export default async function Page() {
  const user = await requireUser();
  return <SettingsPage currentUserId={user.id} isAdmin={user.role === "admin"} />;
}
