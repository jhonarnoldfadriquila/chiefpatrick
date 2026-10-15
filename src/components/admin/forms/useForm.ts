"use client";

import { useState } from "react";
import { ApiClientError } from "@/lib/admin/api";
import { useToast } from "@/components/admin/ui";

/** Form state + submit with server field errors and a success toast. */
export function useForm<T extends Record<string, unknown>>(initial: T) {
  const toast = useToast();
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: "" }));
  };

  async function submit(run: (values: T) => Promise<unknown>, successMessage: string) {
    setSaving(true);
    setErrors({});
    try {
      await run(values);
      toast("success", successMessage);
      return true;
    } catch (err) {
      const e = err as ApiClientError;
      setErrors(e.fields ?? {});
      toast("error", e.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { values, setValues, set, errors, saving, submit };
}
