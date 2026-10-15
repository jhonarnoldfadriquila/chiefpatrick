"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { AdminLogo } from "@/components/admin/shell/Logo";
import { Button, Field, inputCls } from "@/components/admin/ui";
import { api, ApiClientError } from "@/lib/admin/api";

export function LoginForm({ dbDown }: { dbDown?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(dbDown ? "The database is not reachable. Check that MySQL is running." : "");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/login", { email, password });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError((err as ApiClientError).message);
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-svh place-items-center bg-adm-bg px-4">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-xl border border-adm-border bg-adm-card p-7"
      >
        <AdminLogo />
        <h1 className="mt-7 text-xl font-semibold text-adm-text">Sign in to the admin</h1>
        <p className="mt-1 text-sm text-adm-muted">Use your staff email and password.</p>
        <div className="mt-6 space-y-4">
          <Field label="Email">
            {(id) => <input id={id} type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />}
          </Field>
          <Field label="Password">
            {(id) => <input id={id} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />}
          </Field>
        </div>
        {error && (
          <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-adm-red">
            <WarningCircleIcon size={18} className="mt-px shrink-0" /> {error}
          </p>
        )}
        <Button type="submit" loading={loading} className="mt-6 w-full">
          Sign in
        </Button>
      </motion.form>
    </main>
  );
}
