import { X } from "lucide-react";
import { CuteIcon } from "@/components/learning/CuteIcon";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/learning/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Grade } from "@/lib/srs";
import { useProgress } from "@/store/progress";
import { Flashcard } from "./components/Flashcard";
import { GradeButtons } from "./components/GradeButtons";
import { SessionSummary } from "./components/SessionSummary";
import { useReviewSession } from "./use-review-session";

export default function ReviewPage() {
  const { loading, plan, queue, current, stats, start, grade, exit } = useReviewSession();
  const [flipped, setFlipped] = useState(false);
  const [total, setTotal] = useState(0);
  const card = useProgress((s) => (current ? s.cards[current.word.id] : undefined));

  useEffect(() => setFlipped(false), [current?.word.id, stats.done]);

  const begin = (mode: "all" | "due" | "new") => {
    if (!plan) return;
    setTotal(mode === "due" ? plan.due.length : mode === "new" ? plan.fresh.length : plan.due.length + plan.fresh.length);
    start(mode);
  };

  const onGrade = (g: Grade) => {
    if (g === 0) setTotal((t) => t + 1);
    grade(g);
  };

  // Phím tắt: Space/Enter lật, 1–4 chấm
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        onGrade((Number(e.key) - 1) as Grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (loading || !plan) return <Skeleton className="h-96 rounded-lg" />;

  // Đang trong phiên
  if (queue) {
    if (!current) return <SessionSummary stats={stats} onAgain={exit} />;
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={exit} aria-label="Thoát phiên ôn">
            <X />
          </Button>
          <Progress value={(stats.done / Math.max(1, total)) * 100} className="h-3 flex-1" aria-label="Tiến độ phiên" />
          <span className="min-w-12 text-right text-sm font-black text-muted-foreground">
            {stats.done}/{total}
          </span>
        </div>
        <Flashcard word={current.word} isNew={current.isNew} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
        {flipped ? (
          <GradeButtons card={card} onGrade={onGrade} />
        ) : (
          <Button size="lg" className="w-full" onClick={() => setFlipped(true)}>
            Hiện đáp án <kbd className="hidden text-xs opacity-70 md:inline">Space</kbd>
          </Button>
        )}
      </div>
    );
  }

  // Màn bắt đầu
  const nothing = plan.due.length === 0 && plan.fresh.length === 0;
  return (
    <div className="space-y-6">
      <PageHeader icon="review" title="Ôn tập" description="Ôn đúng lúc sắp quên — nhớ lâu mà đỡ tốn thời gian" />
      {nothing ? (
        <EmptyState
          title="Hôm nay xong hết rồi!"
          action={
            <>
              <Button asChild>
                <Link to="/quiz">Luyện tập thêm</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/settings">Tăng số từ mới/ngày</Link>
              </Button>
            </>
          }
        >
          Không còn thẻ đến hạn và bạn đã học đủ từ mới hôm nay. Quay lại vào ngày mai nhé.
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-candy-sky text-candy-sky-foreground">
              <CardContent className="flex items-center gap-4 p-5">
                <CuteIcon name="review" className="size-14" />
                <div>
                  <p className="text-3xl font-black">{plan.due.length}</p>
                  <p className="font-bold">thẻ đến hạn ôn</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-candy-yellow text-candy-yellow-foreground">
              <CardContent className="flex items-center gap-4 p-5">
                <CuteIcon name="vocab" className="size-14" />
                <div>
                  <p className="text-3xl font-black">{plan.fresh.length}</p>
                  <p className="font-bold">từ mới hôm nay</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => begin("all")}>
              Bắt đầu ôn
            </Button>
            {plan.due.length > 0 && plan.fresh.length > 0 && (
              <>
                <Button size="lg" variant="secondary" onClick={() => begin("due")}>
                  Chỉ ôn thẻ cũ
                </Button>
                <Button size="lg" variant="outline" onClick={() => begin("new")}>
                  Chỉ học từ mới
                </Button>
              </>
            )}
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            Mẹo: phím cách để lật thẻ, phím 1–4 để chấm Quên / Khó / Được / Dễ.
          </p>
        </>
      )}
    </div>
  );
}
