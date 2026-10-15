import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { authDisabled, sessionUser, viewOnlyDemo } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ db?: string }> }) {
  const { db } = await searchParams;
  let signedIn = false;
  try {
    signedIn = authDisabled || !!(await sessionUser());
  } catch {
    // Database down: show the form with a notice instead of crashing.
  }
  if (signedIn) redirect("/admin");
  // Pre-fill the admin email (from ADMIN_EMAIL) so only the password needs typing.
  return <LoginForm dbDown={db === "down"} guest={viewOnlyDemo} email={process.env.ADMIN_EMAIL || "admin@chefpatrickskitchen.ph"} />;
}
