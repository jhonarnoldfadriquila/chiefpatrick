"use client";

// Shared admin building blocks: buttons, panels, modal, badges, form fields, toasts, states.
import { createContext, useCallback, useContext, useEffect, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircleIcon, CircleNotchIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/format";

// ---------- buttons ----------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm" | "md"; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
        variant === "primary" && "bg-adm-red text-white hover:bg-adm-red-hover",
        variant === "secondary" && "border border-adm-border bg-adm-card2 text-adm-text hover:border-adm-muted/50",
        variant === "ghost" && "text-adm-muted hover:bg-adm-card2 hover:text-adm-text",
        variant === "danger" && "text-adm-red hover:bg-adm-red/10",
        className,
      )}
    >
      {loading && <CircleNotchIcon size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

// ---------- panel ----------

export function Panel({ title, action, children, className, bodyClassName }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex min-w-0 flex-col rounded-lg border border-adm-border bg-adm-card", className)}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-adm-border px-4 py-3">
          <h2 className="text-sm font-semibold text-adm-text">{title}</h2>
          {action}
        </header>
      )}
      <div className={cn("min-w-0 flex-1", bodyClassName)}>{children}</div>
    </motion.section>
  );
}

// ---------- status badge ----------

const BADGE: Record<string, string> = {
  confirmed: "bg-adm-green/12 text-adm-green",
  completed: "bg-adm-blue/12 text-adm-blue",
  resolved: "bg-adm-green/12 text-adm-green",
  pending: "bg-adm-yellow/12 text-adm-yellow",
  in_progress: "bg-adm-yellow/12 text-adm-yellow",
  new: "bg-adm-blue/12 text-adm-blue",
  cancelled: "bg-adm-red/12 text-adm-red",
  live: "bg-adm-green/12 text-adm-green",
  hidden: "bg-adm-muted/12 text-adm-muted",
};

export const statusLabel = (s: string) => s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium whitespace-nowrap", BADGE[status] ?? BADGE.hidden, className)}
      >
        {statusLabel(status)}
      </motion.span>
    </AnimatePresence>
  );
}

// ---------- modal ----------

export function Modal({ open, onClose, title, children, footer, size = "md" }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "flex max-h-[92svh] w-full flex-col rounded-t-xl border border-adm-border bg-adm-card shadow-2xl sm:rounded-xl",
              size === "sm" && "sm:max-w-md",
              size === "md" && "sm:max-w-xl",
              size === "lg" && "sm:max-w-3xl",
            )}
          >
            <header className="flex items-center justify-between gap-3 border-b border-adm-border px-5 py-4">
              <h2 className="text-base font-semibold text-adm-text">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-card2 hover:text-adm-text">
                <XIcon size={18} />
              </button>
            </header>
            <div className="overflow-y-auto px-5 py-4">{children}</div>
            {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-adm-border px-5 py-3">{footer}</footer>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- form fields ----------

export const inputCls =
  "block w-full rounded-md border border-adm-border bg-adm-bg px-3 py-2 text-sm text-adm-text placeholder:text-adm-muted/50 outline-none transition-colors focus:border-adm-red aria-[invalid=true]:border-adm-red";

export function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: (id: string) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-adm-muted">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p className="mt-1 text-xs text-adm-red" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-adm-muted/70">{hint}</p>
      ) : null}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-adm-text select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-adm-red" : "bg-adm-border")}
      >
        <motion.span layout transition={{ duration: 0.15 }} className={cn("absolute top-0.5 size-4 rounded-full bg-white", checked ? "right-0.5" : "left-0.5")} />
      </button>
      {label}
    </label>
  );
}

// ---------- states ----------

export const Spinner = ({ className }: { className?: string }) => <CircleNotchIcon size={20} className={cn("animate-spin text-adm-muted", className)} />;

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-9 animate-pulse rounded-md bg-adm-card2" />
      ))}
    </div>
  );
}

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("px-4 py-10 text-center text-sm text-adm-muted", className)}>{children}</p>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <WarningCircleIcon size={28} className="text-adm-red" />
      <p className="max-w-sm text-sm text-adm-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

// ---------- toasts ----------

interface Toast {
  id: number;
  kind: "success" | "error";
  message: string;
}
const ToastContext = createContext<(kind: Toast["kind"], message: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[200] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-lg border border-adm-border bg-adm-card2 px-4 py-3 text-sm text-adm-text shadow-xl"
            >
              {t.kind === "success" ? <CheckCircleIcon size={18} weight="fill" className="text-adm-green" /> : <WarningCircleIcon size={18} weight="fill" className="text-adm-red" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ---------- confirm ----------

/** Promise-based confirm dialog: `if (await confirm("Delete?")) ...` */
export function useConfirm() {
  const [state, setState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);
  const confirm = useCallback((message: string) => new Promise<boolean>((resolve) => setState({ message, resolve })), []);
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  const dialog = (
    <Modal
      open={!!state}
      onClose={() => close(false)}
      title="Are you sure?"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button onClick={() => close(true)}>Confirm</Button>
        </>
      }
    >
      <p className="text-sm text-adm-muted">{state?.message}</p>
    </Modal>
  );
  return { confirm, dialog };
}

// ---------- pagination ----------

export function Pager({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-adm-border px-4 py-3 text-xs text-adm-muted">
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(total, page * pageSize)} of {total}
      </span>
      <div className="flex gap-1">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
