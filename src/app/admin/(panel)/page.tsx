import type { Metadata } from "next";
import { Dashboard } from "@/components/admin/dashboard/Dashboard";
import { requireUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  return <Dashboard userName={user.name} />;
}
