import type { ReactNode } from "react";

export function SettingRow({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <label htmlFor={htmlFor} className="font-bold">
          {label}
        </label>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export const selectClass =
  "h-11 rounded-xl border-2 border-input bg-card px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
