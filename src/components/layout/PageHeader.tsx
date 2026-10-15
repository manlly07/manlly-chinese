import type { ReactNode } from "react";
import { type CuteName, CuteIcon } from "@/components/learning/CuteIcon";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** icon minh hoạ cạnh tiêu đề */
  icon?: CuteName;
}

export function PageHeader({ title, description, actions, icon }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-card shadow-soft md:size-16">
            <CuteIcon name={icon} className="size-10 transition-transform hover:-rotate-6 hover:scale-110 md:size-12" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
          {description && <p className="mt-1 font-semibold text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
