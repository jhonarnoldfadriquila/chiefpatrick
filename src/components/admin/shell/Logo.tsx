import { ChefHatIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/format";

/** White chef-hat outline with a red accent, the name in white, KITCHEN in small red capitals. */
export function AdminLogo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-adm-red/60">
        <ChefHatIcon size={22} weight="light" className="text-white" />
        <span aria-hidden className="absolute -top-0.5 right-1 size-1.5 rounded-full bg-adm-red" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[15px] font-semibold tracking-tight text-white">Chef Patrick&rsquo;s</span>
          <span className="mt-1 block text-[9px] font-semibold tracking-[0.32em] text-adm-red">KITCHEN</span>
        </span>
      )}
    </span>
  );
}
