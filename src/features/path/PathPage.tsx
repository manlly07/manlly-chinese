import { Check, Lock, Star, Wrench } from "lucide-react";
import { CuteIcon } from "@/components/learning/CuteIcon";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Mascot } from "@/components/learning/Mascot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { usePath } from "@/hooks/use-path";
import { stars } from "@/lib/path";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";

// lệch ngang tạo đường uốn lượn
const OFFSET = [0, 56, 84, 56, 0, -56, -84, -56];
const LEVEL_INFO: Record<number, { name: string; cls: string }> = {
  0: { name: "Chặng 0 · Nhập môn pinyin", cls: "from-candy-lilac to-candy-sky" },
  1: { name: "HSK 1 · Sơ cấp 1", cls: "from-candy-pink to-candy-yellow" },
  2: { name: "HSK 2 · Sơ cấp 2", cls: "from-candy-sky to-candy-mint" },
};

export default function PathPage() {
  const { lessons, states, next, progress, checkpoints, cpStates, nextCheckpoint, needsReview } = usePath();
  const tests = useProgress((s) => s.tests);
  if (!lessons) return <Skeleton className="h-[40rem] rounded-lg" />;

  const done = lessons.filter((l) => states.get(l.id) === "done").length;
  const levels = [...new Set(lessons.map((l) => l.level))];

  return (
    <div className="space-y-6">
      <PageHeader
        icon="path"
        title="Lộ trình"
        description="Học theo bài: từ mới → ngữ pháp → hội thoại → bài tập. Đạt 80% để mở bài tiếp theo."
        actions={
          <Button variant="secondary" asChild>
            <Link to="/placement">
              <CuteIcon name="target" className="!size-6" /> Kiểm tra xếp lớp
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="min-w-48 flex-1 space-y-2">
            <p className="font-black">
              Đã hoàn thành {done}/{lessons.length} bài
            </p>
            <Progress value={(done / lessons.length) * 100} aria-label="Tiến độ lộ trình" />
          </div>
          {nextCheckpoint && (!next || states.get(next.id) === "locked" || lessons.indexOf(next) > lessons.findIndex((l) => l.id === nextCheckpoint.lessons.at(-1)!.id)) ? (
            <Button size="lg" asChild>
              <Link to={`/test/${nextCheckpoint.id}`}>
                <CuteIcon name="shield" className="!size-6" /> {nextCheckpoint.title}
              </Link>
            </Button>
          ) : (
            next && (
              <Button size="lg" asChild>
                <Link to={`/lesson/${next.id}`}>Học tiếp: {next.title}</Link>
              </Button>
            )
          )}
        </CardContent>
      </Card>

      {levels.map((lvl) => {
        const list = lessons.filter((l) => l.level === lvl);
        return (
          <section key={lvl} className="space-y-6">
            <div className={cn("rounded-lg bg-gradient-to-r p-4 shadow-soft", LEVEL_INFO[lvl]?.cls)}>
              <h2 className="text-lg font-black text-foreground">{LEVEL_INFO[lvl]?.name ?? `HSK ${lvl}`}</h2>
              <p className="text-sm font-bold text-foreground/70">
                {list.filter((l) => states.get(l.id) === "done").length}/{list.length} bài
              </p>
              {lvl === 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="flex-1 text-sm font-semibold text-foreground/80">
                    Học từng phụ âm đầu và vần riêng lẻ, rồi tự ghép thành âm tiết — để đọc được mọi chữ về sau.
                  </p>
                  {list.some((l) => states.get(l.id) !== "done") && (
                    <Button variant="secondary" size="sm" asChild>
                      <Link to="/test/pinyin">Đã biết pinyin? Kiểm tra nhanh</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
            <ol className="flex flex-col items-center gap-5 pb-4">
              {list.map((l, i) => {
                const st = states.get(l.id);
                const best = progress[l.id]?.best ?? 0;
                const isNext = next?.id === l.id;
                const node = (
                  <span
                    className={cn(
                      "relative flex size-20 items-center justify-center rounded-full text-2xl font-black transition-transform",
                      st === "done" && "btn-pop bg-candy-mint-foreground text-card [--btn-shadow:var(--chart-mature)]",
                      st === "open" && "btn-pop bg-primary text-primary-foreground",
                      st === "locked" && "bg-muted text-muted-foreground",
                      isNext && "ring-4 ring-primary/30 ring-offset-4 ring-offset-background",
                    )}
                  >
                    {st === "done" ? <Check className="size-9" strokeWidth={3} /> : st === "locked" ? <Lock className="size-7" /> : i + 1}
                    {isNext && <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" aria-hidden />}
                  </span>
                );
                const cp = checkpoints.find((c) => c.lessons.at(-1)!.id === l.id);
                const cpSt = cp && cpStates.get(cp.id);
                const cracked = needsReview.some((x) => x.id === l.id);
                return (
                  <Fragment key={l.id}>
                  <li className="relative flex flex-col items-center" style={{ transform: `translateX(${OFFSET[i % OFFSET.length]}px)` }}>
                    {isNext && (
                      <Mascot className={cn("absolute top-0 size-16 animate-wiggle", OFFSET[i % OFFSET.length] > 0 ? "-left-20" : "-right-20")} />
                    )}
                    {st === "locked" ? (
                      <div aria-label={`Bài ${i + 1}: ${l.title} — đang khoá`} title="Hoàn thành bài trước (≥ 80%) để mở">
                        {node}
                      </div>
                    ) : (
                      <Link to={`/lesson/${l.id}`} aria-label={`Bài ${i + 1}: ${l.title}`} className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">
                        {node}
                      </Link>
                    )}
                    <span className={cn("mt-2 max-w-40 text-center text-sm font-black", st === "locked" && "text-muted-foreground")}>{l.title}</span>
                    {st === "done" && (
                      <span className="flex gap-0.5" aria-label={`${stars(best)} sao`}>
                        {[1, 2, 3].map((n) => (
                          <Star key={n} className={cn("size-4", n <= stars(best) ? "fill-chart-new text-chart-new" : "text-muted-foreground/40")} aria-hidden />
                        ))}
                      </span>
                    )}
                    {cracked && (
                      <Link
                        to={`/practice/lesson?id=${l.id}`}
                        className="mt-1 inline-flex items-center gap-1 rounded-full bg-candy-yellow px-2.5 py-0.5 text-xs font-black text-candy-yellow-foreground"
                      >
                        <Wrench className="size-3" aria-hidden /> Cần ôn
                      </Link>
                    )}
                  </li>
                  {cp && (
                    <li className="flex w-full max-w-sm flex-col items-center gap-2 py-2">
                      {cpSt === "locked" ? (
                        <div
                          className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 text-muted-foreground"
                          aria-label={`${cp.title} — đang khoá`}
                        >
                          <CuteIcon name="lock" className="size-11 opacity-70" />
                          <span className="font-black">{cp.title}<span className="block text-xs font-bold">Hoàn thành {cp.lessons.length} bài trên để mở</span></span>
                        </div>
                      ) : (
                        <Link
                          to={`/test/${cp.id}`}
                          className={cn(
                            "btn-pop flex w-full items-center gap-3 rounded-2xl p-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
                            cpSt === "done"
                              ? "bg-candy-mint text-candy-mint-foreground [--btn-shadow:var(--candy-mint-foreground)]"
                              : "bg-candy-yellow text-candy-yellow-foreground [--btn-shadow:var(--candy-yellow-foreground)]",
                          )}
                        >
                          <CuteIcon name={cpSt === "done" ? "medal" : "shield"} className="size-12" />
                          <span className="flex-1 font-black">
                            {cp.title}
                            <span className="block text-xs font-bold">
                              {cpSt === "done"
                                ? `Đã qua · cao nhất ${Math.round((tests[cp.id]?.best ?? 1) * 100)}%`
                                : "Đạt 80% để mở chặng tiếp theo"}
                            </span>
                          </span>
                          {cpSt === "done" ? <Check className="size-6" aria-hidden /> : <span className="text-sm font-black">Làm bài →</span>}
                        </Link>
                      )}
                    </li>
                  )}
                  </Fragment>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
