import { AdminShell } from "@/components/admin/shell/AdminShell";
import { requireUser } from "@/lib/server/auth";

// Every page in (panel) needs a signed-in staff account.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
