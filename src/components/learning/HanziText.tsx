import { cn } from "@/lib/utils";
import { useSettings } from "@/store/settings";

const SIZE = {
  sm: { list: "text-2xl", card: "text-6xl md:text-7xl", inline: "text-lg" },
  md: { list: "text-3xl", card: "text-7xl md:text-8xl", inline: "text-xl" },
  lg: { list: "text-4xl", card: "text-8xl md:text-9xl", inline: "text-2xl" },
} as const;

interface HanziTextProps {
  children: string;
  /** ngữ cảnh hiển thị — cỡ chữ theo cài đặt "Kích thước chữ Hán" */
  variant?: "list" | "card" | "inline";
  className?: string;
}

export function HanziText({ children, variant = "inline", className }: HanziTextProps) {
  const size = useSettings((s) => s.hanziSize);
  return (
    <span lang="zh-CN" className={cn("hanzi leading-tight", SIZE[size][variant], className)}>
      {children}
    </span>
  );
}
