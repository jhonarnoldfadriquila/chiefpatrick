import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { authDisabled, sessionUser } from "@/lib/server/auth";

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
  return <LoginForm dbDown={db === "down"} />;
}
