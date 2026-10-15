import type { ReactNode } from "react";
import { type CuteName, CuteIcon } from "./CuteIcon";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LABELS, type ExerciseCategory } from "@/lib/exercises";
import { formatDuration } from "@/lib/stats";
import { cn } from "@/lib/utils";
import type { RunnerResult } from "./exercises/ExerciseRunner";
import { Mascot } from "./Mascot";

interface Props {
  result: RunnerResult;
  xp: number;
  title: string;
  subtitle?: string;
  pass?: boolean;
  actions: ReactNode;
}

/** Màn kết thúc phiên kiểu Duolingo: điểm, XP, combo, thời gian, chia theo kỹ năng. */
export function SessionResult({ result, xp, title, subtitle, pass = true, actions }: Props) {
  const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
  const tiles = [
    { icon: "target" as CuteName, label: "Chính xác", value: `${pct}%`, cls: "bg-candy-mint text-candy-mint-foreground" },
    { icon: "star" as CuteName, label: "XP", value: `+${xp}`, cls: "bg-candy-yellow text-candy-yellow-foreground" },
    { icon: "flame" as CuteName, label: "Combo", value: `${result.maxCombo}`, cls: "bg-candy-pink text-candy-pink-foreground" },
    { icon: "clock" as CuteName, label: "Thời gian", value: formatDuration(result.seconds), cls: "bg-candy-sky text-candy-sky-foreground" },
  ];
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="flex flex-col items-center gap-5 p-6 text-center md:p-8">
        <Mascot mood={pass ? "happy" : "sleepy"} className="size-28 animate-wiggle" />
        <div>
          <h1 className="text-2xl font-black">{title}</h1>
          {subtitle && <p className="mt-1 font-semibold text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
          {tiles.map(({ icon, label, value, cls }) => (
            <div key={label} className={cn("rounded-2xl p-3", cls)}>
              <CuteIcon name={icon} className="mx-auto size-10" />
              <p className="mt-1 text-xl font-black leading-tight">{value}</p>
              <p className="text-xs font-bold">{label}</p>
            </div>
          ))}
        </div>
        <div className="w-full space-y-2 text-left">
          {(Object.entries(result.byCategory) as [ExerciseCategory, { correct: number; total: number }][]).map(([cat, v]) => (
            <div key={cat} className="space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className="tabular-nums text-muted-foreground">
                  {v.correct}/{v.total}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-chart-series" style={{ width: `${(v.correct / Math.max(1, v.total)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        {result.wrongRefs.length > 0 && (
          <p className="text-sm font-semibold text-muted-foreground">{result.wrongRefs.length} câu sai đã vào Sổ lỗi sai để luyện lại.</p>
        )}
        <div className="flex flex-wrap justify-center gap-3">{actions}</div>
      </CardContent>
    </Card>
  );
}
