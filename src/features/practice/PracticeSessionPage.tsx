import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/learning/EmptyState";
import { ExerciseRunner, type RunnerResult } from "@/components/learning/exercises/ExerciseRunner";
import { SessionResult } from "@/components/learning/SessionResult";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledge } from "@/hooks/use-knowledge";
import { buildLessonExercises, type Exercise } from "@/lib/exercises";
import { buildDailyReview, buildMistakeSession, dailyReviewId, type Knowledge } from "@/lib/review-mix";
import { useProgress } from "@/store/progress";

type Mode = "daily" | "mistakes" | "lesson";

function build(mode: Mode, k: Knowledge, lessonId: string | null): { title: string; exercises: Exercise[] } {
  const p = useProgress.getState();
  if (mode === "mistakes") return { title: "Sửa lỗi sai", exercises: buildMistakeSession(k, p.mistakes) };
  if (mode === "lesson") {
    const l = k.lessons.find((x) => x.id === lessonId);
    if (!l) return { title: "Ôn lại bài", exercises: [] };
    const words = l.words.map((id) => k.words.get(id)!).filter(Boolean);
    const pool = [...k.words.values()].filter((w) => w.hsk2 === l.level);
    const grammar = l.grammar.map((id) => k.grammar.get(id)!).filter(Boolean);
    return { title: `Ôn lại: ${l.title}`, exercises: buildLessonExercises(words, grammar, pool, pool) };
  }
  return { title: "Ôn tổng hợp", exercises: buildDailyReview(k, p) };
}

/** Phiên luyện không khoá: ôn tổng hợp / sửa lỗi sai / ôn lại một bài. */
export default function PracticeSessionPage() {
  const { mode = "daily" } = useParams() as { mode: Mode };
  const [params] = useSearchParams();
  const k = useKnowledge();
  const review = useProgress((s) => s.review);
  const recordTest = useProgress((s) => s.recordTest);
  const [session, setSession] = useState<{ title: string; exercises: Exercise[] } | null>(null);
  const [result, setResult] = useState<{ r: RunnerResult; xp: number } | null>(null);

  const lessonId = params.get("id");
  useEffect(() => {
    if (k) setSession(build(mode, k, lessonId));
    setResult(null);
  }, [k, mode, lessonId]);

  if (!k || !session) return <Skeleton className="h-96 rounded-lg" />;
  const s = session;

  if (!s.exercises.length)
    return mode === "mistakes" ? (
      <EmptyState title="Sổ lỗi sai đang trống 🎉" action={<Button asChild><Link to="/practice">Về luyện tập</Link></Button>}>
        Bạn chưa sai câu nào cần luyện lại. Cứ tiếp tục giữ phong độ nhé!
      </EmptyState>
    ) : (
      <EmptyState title="Chưa có gì để ôn" action={<Button asChild><Link to="/path">Học bài đầu tiên</Link></Button>}>
        Học ít nhất một bài trong Lộ trình rồi quay lại nhé.
      </EmptyState>
    );

  const restart = () => {
    setResult(null);
    setSession(build(mode, k, lessonId));
  };

  if (result)
    return (
      <SessionResult
        result={result.r}
        xp={result.xp}
        title={mode === "mistakes" ? "Đã sửa lỗi! 🛠️" : "Ôn xong rồi! 🎉"}
        subtitle={result.r.correct === result.r.total ? "Không sai câu nào — xuất sắc!" : undefined}
        actions={
          <>
            <Button size="lg" onClick={restart}>
              <RotateCcw /> Luyện thêm
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/practice">Về luyện tập</Link>
            </Button>
          </>
        }
      />
    );

  return (
    <ExerciseRunner
      key={s.exercises.map((e) => e.ref).join()}
      label={s.title}
      exercises={s.exercises}
      onExit={() => history.back()}
      onFinish={(r) => {
        // Trả lời trúng từ đang đến hạn = một lượt ôn SRS (giúp bài "cần ôn" hồi phục)
        const { cards } = useProgress.getState();
        const now = Date.now();
        let xp = 0;
        for (const id of r.rightWords) if (cards[id] && cards[id].due <= now) xp += review(id, 2, { seconds: 6 });
        for (const id of r.wrongWords) if (cards[id] && cards[id].due <= now) xp += review(id, 0, { seconds: 6 });
        if (mode === "daily") xp += recordTest(dailyReviewId(now), r.correct / r.total, { pass: 0.5, seconds: r.seconds });
        setResult({ r, xp });
      }}
    />
  );
}
