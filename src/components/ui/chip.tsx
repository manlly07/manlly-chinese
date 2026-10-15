import * as React from "react";
import { cn } from "@/lib/utils";

/** Nút lọc dạng viên thuốc (toggle). */
export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(({ active, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-pressed={active}
    className={cn(
      "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active
        ? "border-transparent bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      className,
    )}
    {...props}
  />
));
Chip.displayName = "Chip";
