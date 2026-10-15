import { RotateCcw } from "lucide-react";
import { CuteIcon } from "@/components/learning/CuteIcon";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "@/components/learning/EmptyState";
import { ExerciseRunner, type RunnerResult } from "@/components/learning/exercises/ExerciseRunner";
import { SessionResult } from "@/components/learning/SessionResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledge } from "@/hooks/use-knowledge";
import { usePath } from "@/hooks/use-path";
import type { Exercise } from "@/lib/exercises";
import { PASS_SCORE } from "@/lib/path";
import { buildCheckpointTest, buildWeeklyTest, learnedLessons, weeklyTestId } from "@/lib/review-mix";
import { useProgress } from "@/store/progress";

/** Bài kiểm tra có chấm điểm: kiểm tra chặng (cp-…) hoặc tổng hợp tuần (weekly). */
export default function TestPage() {
  const { id = "" } = useParams();
  const k = useKnowledge();
  const { checkpoints, cpStates, lessons } = usePath();
  const recordTest = useProgress((s) => s.recordTest);
  const best = useProgress((s) => s.tests);
  const [run, setRun] = useState<Exercise[] | null>(null);
  const [result, setResult] = useState<{ r: RunnerResult; xp: number } | null>(null);

  const isWeekly = id === "weekly";
  const testId = isWeekly ? weeklyTestId() : id;
  const cp = checkpoints.find((c) => c.id === id);

  const meta = useMemo(() => {
    if (isWeekly) return { title: "Kiểm tra tổng hợp tuần", desc: "20 câu trộn từ mọi bài bạn đã học — ưu tiên phần dễ quên." };
    if (cp) return { title: cp.title, desc: cp.final ? `Phủ toàn bộ HSK ${cp.level} và một ít kiến thức cấp trước.` : `Bài ${cp.lessons[0].id.slice(-2)}–${cp.lessons.at(-1)!.id.slice(-2)} và ôn lại các bài trước đó.` };
    return null;
  }, [isWeekly, cp]);

  if (!k || !lessons) return <Skeleton className="h-96 rounded-lg" />;
  if (!meta) return <EmptyState title="Không tìm thấy bài kiểm tra" mood="sleepy" action={<Button asChild><Link to="/path">Về lộ trình</Link></Button>} />;

  const p = useProgress.getState();
  const learned = learnedLessons(k, p);
  if (cp && cpStates.get(cp.id) === "locked")
    return (
      <EmptyState title={`${cp.title} đang khoá`} mood="sleepy" action={<Button asChild><Link to="/path">Về lộ trình</Link></Button>}>
        Hoàn thành cả {cp.lessons.length} bài của chặng để mở bài kiểm tra.
      </EmptyState>
    );
  if (isWeekly && !learned.length)
    return <EmptyState title="Chưa có gì để kiểm tra" action={<Button asChild><Link to="/path">Học bài đầu tiên</Link></Button>}>Học ít nhất một bài rồi quay lại nhé.</EmptyState>;

  const start = () => {
    setResult(null);
    setRun(cp ? buildCheckpointTest(k, cp, p) : buildWeeklyTest(k, p));
  };

  if (result) {
    const score = result.r.correct / result.r.total;
    const pass = score >= PASS_SCORE;
    const nextL = cp ? lessons[lessons.findIndex((l) => l.id === cp.lessons.at(-1)!.id) + 1] : undefined;
    return (
      <SessionResult
        result={result.r}
        xp={result.xp}
        pass={pass}
        title={pass ? (cp ? `Qua ${cp.title.toLowerCase()}! 🏆` : "Hoàn thành kiểm tra tuần! 🏆") : "Chưa đạt — cần 80%"}
        subtitle={pass ? (nextL ? `Đã mở: ${nextL.title}` : "Kiến thức của bạn rất vững.") : "Ôn lại các câu sai trong Sổ lỗi rồi thử lại nhé."}
        actions={
          <>
            {pass && nextL ? (
              <Button size="lg" asChild>
                <Link to={`/lesson/${nextL.id}`}>Học tiếp</Link>
              </Button>
            ) : (
              <Button size="lg" onClick={start}>
                <RotateCcw /> Làm lại
              </Button>
            )}
            {!pass && (
              <Button size="lg" variant="secondary" asChild>
                <Link to="/practice/mistakes">Sửa lỗi sai</Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link to={cp ? "/path" : "/practice"}>{cp ? "Về lộ trình" : "Về luyện tập"}</Link>
            </Button>
          </>
        }
      />
    );
  }

  if (run)
    return (
      <ExerciseRunner
        label={meta.title}
        exercises={run}
        onExit={() => setRun(null)}
        onFinish={(r) => {
          const score = r.correct / r.total;
          const xp = recordTest(testId, score, { seconds: r.seconds });
          setResult({ r, xp });
          setRun(null);
        }}
      />
    );

  const prev = best[testId];
  return (
    <Card className="mx-auto max-w-xl overflow-hidden">
      <div className="bg-gradient-to-br from-candy-yellow via-candy-pink to-candy-lilac p-6 text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-card/80">
          <CuteIcon name={cp ? "shield" : "clipboard"} className="size-14 animate-wiggle" />
        </span>
        <h1 className="mt-3 text-2xl font-black">{meta.title}</h1>
        <p className="font-bold text-foreground/70">{meta.desc}</p>
      </div>
      <CardContent className="space-y-4 p-6">
        <ul className="space-y-1.5 font-semibold">
          <li>✅ Trộn từ vựng, ngữ pháp và nghe hiểu</li>
          <li>🎯 Cần đúng ≥ 80% để {cp ? "mở chặng tiếp theo" : "hoàn thành"}</li>
          <li>📒 Câu sai tự động vào Sổ lỗi sai</li>
          <li>🔁 Làm lại bao nhiêu lần cũng được — lấy điểm cao nhất</li>
        </ul>
        {prev && (
          <p className="rounded-2xl bg-muted/70 p-3 text-sm font-bold">
            Lần trước: {Math.round(prev.last * 100)}% · cao nhất {Math.round(prev.best * 100)}% · {prev.attempts} lần làm
          </p>
        )}
        <Button size="lg" className="w-full" onClick={start}>
          Bắt đầu kiểm tra
        </Button>
      </CardContent>
    </Card>
  );
}
