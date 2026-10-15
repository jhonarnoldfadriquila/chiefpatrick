import { cn } from "@/lib/format";

/** "(02) Manifesto ———— Caloocan · 2009": the index, the name and a little meta over a 1px rule. */
export function SectionLabel({ index, label, meta, className }: { index: string; label: string; meta?: string; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-6 border-t border-line pt-4", className)}>
      <p className="micro text-rice">
        <span className="text-red-glow">({index})</span> {label}
      </p>
      {meta && <p className="micro text-right text-muted">{meta}</p>}
    </div>
  );
}
