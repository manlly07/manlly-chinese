import { CheckCircle2, Gift } from "lucide-react";
import { type CuteName, CuteIcon } from "./CuteIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateKey } from "@/lib/date";
import { dailyReviewId } from "@/lib/review-mix";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { useSettings } from "@/store/settings";

/** Nhiệm vụ hằng ngày — tính từ lịch sử hôm nay, không cần lưu thêm. */
export function DailyQuests({ compact = false }: { compact?: boolean }) {
  const day = useProgress((s) => s.history[dateKey()]);
  const tests = useProgress((s) => s.tests);
  const goal = useSettings((s) => s.dailyGoalXp);
  const reviewedToday = !!tests[dailyReviewId()];
  const quests = [
    { label: `Đạt ${goal} XP`, cur: day?.xp ?? 0, max: goal, icon: "star" as CuteName },
    { label: "Trả lời đúng 20 câu", cur: day?.correct ?? 0, max: 20, icon: "heart" as CuteName },
    { label: "Ôn tổng hợp 1 lần", cur: reviewedToday ? 1 : 0, max: 1, icon: "sparkle" as CuteName },
  ];
  const done = quests.filter((q) => q.cur >= q.max).length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CuteIcon name="gift" className="size-9" /> Nhiệm vụ hôm nay
        </CardTitle>
        <span className={cn("flex items-center gap-1 rounded-full px-3 py-1 text-sm font-black", done === quests.length ? "bg-candy-mint text-candy-mint-foreground" : "bg-muted text-muted-foreground")}>
          <Gift className="size-4" aria-hidden /> {done}/{quests.length}
        </span>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "pt-0")}>
        {quests.map((q) => {
          const ok = q.cur >= q.max;
          return (
            <div key={q.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm font-bold">
                <span className="flex items-center gap-2">
                  <CuteIcon name={q.icon} className="size-7" /> {q.label}
                  {ok && <CheckCircle2 className="size-4 text-candy-mint-foreground" aria-label="Xong" />}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {Math.min(q.cur, q.max)}/{q.max}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full transition-all", ok ? "bg-chart-mature" : "bg-chart-new")} style={{ width: `${Math.min(100, (q.cur / q.max) * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
