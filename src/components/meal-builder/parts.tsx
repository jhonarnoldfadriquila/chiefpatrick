"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/format";

/** − 12 + : whole-number stepper with bounds. */
export function Stepper({ value, onChange, min, max, label, step = 1 }: { value: number; onChange: (n: number) => void; min: number; max: number; label: string; step?: number }) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));
  return (
    <div className="inline-flex h-12 items-stretch border border-line">
      <button type="button" aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(clamp(value - step))} className="grid w-12 place-items-center transition-colors hover:bg-surface disabled:opacity-30">
        <MinusIcon size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || min)}
        onBlur={(e) => onChange(clamp(Number(e.target.value) || min))}
        className="w-16 border-x border-line bg-transparent text-center text-lg tabular-nums outline-none [appearance:textfield] focus:bg-surface [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(clamp(value + step))} className="grid w-12 place-items-center transition-colors hover:bg-surface disabled:opacity-30">
        <PlusIcon size={16} />
      </button>
    </div>
  );
}

/** A selectable row or chip; pressed state fills red. */
export function Choice({ active, onClick, children, className, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "border text-left transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-35",
        active ? "border-red bg-red text-rice" : "border-line hover:border-rice",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={id} role="alert" className="mt-2 text-sm text-red-glow">
      {error}
    </p>
  ) : null;
}

export const inputClass =
  "block h-14 w-full border-b border-line bg-transparent text-lg text-rice placeholder:text-muted/70 outline-none transition-colors focus:border-red-glow";
