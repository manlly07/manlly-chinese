import { type CuteName, CuteIcon } from "@/components/learning/CuteIcon";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BarChart } from "@/components/learning/BarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { useVocab } from "@/hooks/use-vocab";
import { dateKey } from "@/lib/date";
import { distribution, forecast, formatDuration, lastDays, shortDay, totals, weekday } from "@/lib/stats";
import { computeStreak } from "@/lib/streak";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";

type Metric = "xp" | "reviews" | "accuracy";
const METRICS: { key: Metric; label: string; unit: string }[] = [
  { key: "xp", label: "XP", unit: "" },
  { key: "reviews", label: "lượt ôn", unit: "" },
  { key: "accuracy", label: "độ chính xác", unit: "%" },
];

function Tile({ icon, label, value, cls }: { icon: CuteName; label: string; value: string; cls: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg p-3 sm:p-4", cls)}>
      <CuteIcon name={icon} className="size-11 sm:size-12" />
      <div className="min-w-0">
        <p className="truncate text-xl font-black leading-tight">{value}</p>
        <p className="text-xs font-bold opacity-90">{label}</p>
      </div>
    </div>
  );
}

const SEGMENTS = [
  { key: "new", label: "Chưa học", cls: "bg-chart-new" },
  { key: "learning", label: "Đang học", cls: "bg-chart-learning" },
  { key: "mature", label: "Đã thuộc (≥ 21 ngày)", cls: "bg-chart-mature" },
] as const;

export default function StatsPage() {
  const history = useProgress((s) => s.history);
  const cards = useProgress((s) => s.cards);
  const { words } = useVocab();
  const [metric, setMetric] = useState<Metric>("xp");

  const today = dateKey();
  const days = useMemo(() => lastDays(history, 30, today), [history, today]);
  const all = useMemo(() => totals(history), [history]);
  const dist = useMemo(() => distribution(cards, words.length), [cards, words.length]);
  const fc = useMemo(() => forecast(cards, 7, Date.now()), [cards]);
  const streak = computeStreak(history, today).streak;
  const m = METRICS.find((x) => x.key === metric)!;

  const bars = days.map((d) => ({
    key: d.day,
    label: shortDay(d.day),
    value: metric === "accuracy" ? (d.reviews ? Math.round((d.correct / d.reviews) * 100) : 0) : d[metric],
    detail: metric === "accuracy" ? `${d.correct}/${d.reviews} câu đúng` : metric === "reviews" ? `${d.correct} lượt nhớ` : `${d.reviews} lượt ôn`,
  }));
  const distTotal = Math.max(1, dist.new + dist.learning + dist.mature);

  return (
    <div className="space-y-6">
      <PageHeader icon="stats" title="Thống kê" description="Nhìn lại hành trình học của bạn" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile icon="flame" label="Ngày liên tiếp" value={`${streak} ngày`} cls="bg-candy-yellow text-candy-yellow-foreground" />
        <Tile icon="calendar" label="Ngày đã học" value={`${all.days}`} cls="bg-candy-pink text-candy-pink-foreground" />
        <Tile icon="target" label="Độ chính xác" value={all.reviews ? `${Math.round(all.accuracy * 100)}%` : "—"} cls="bg-candy-mint text-candy-mint-foreground" />
        <Tile icon="clock" label="Thời gian học (ước tính)" value={formatDuration(all.seconds)} cls="bg-candy-sky text-candy-sky-foreground" />
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-4">
          <CardTitle className="text-lg">30 ngày qua · {m.label}</CardTitle>
          <div className="flex gap-2">
            {METRICS.map((x) => (
              <Chip key={x.key} active={metric === x.key} onClick={() => setMetric(x.key)}>
                {x.label.charAt(0).toUpperCase() + x.label.slice(1)}
              </Chip>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <BarChart bars={bars} name={m.label} unit={m.unit} tickEvery={7} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Phân bố từ vựng</CardTitle>
            <p className="text-sm font-semibold text-muted-foreground">{words.length} từ trong dữ liệu HSK</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-6 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`Chưa học ${dist.new}, đang học ${dist.learning}, đã thuộc ${dist.mature}`}>
              {SEGMENTS.map((s) =>
                dist[s.key] ? (
                  <span key={s.key} title={`${s.label}: ${dist[s.key]}`} className={cn("h-full", s.cls)} style={{ width: `${(dist[s.key] / distTotal) * 100}%` }} />
                ) : null,
              )}
            </div>
            <ul className="space-y-2">
              {SEGMENTS.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-sm">
                  <span className={cn("size-3 rounded-full", s.cls)} aria-hidden />
                  <span className="flex-1 font-semibold">{s.label}</span>
                  <span className="font-black tabular-nums">{dist[s.key]}</span>
                  <span className="w-12 text-right font-bold tabular-nums text-muted-foreground">{Math.round((dist[s.key] / distTotal) * 100)}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Dự báo thẻ đến hạn · 7 ngày</CardTitle>
            <p className="text-sm font-semibold text-muted-foreground">Hôm nay gồm cả thẻ đã quá hạn</p>
          </CardHeader>
          <CardContent>
            <BarChart
              bars={fc.map((d, i) => ({ key: d.day, label: i === 0 ? "Nay" : weekday(d.day), value: d.count, detail: shortDay(d.day) }))}
              name="thẻ"
              tickEvery={1}
              height={130}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
