import { ArrowLeft, Dumbbell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "@/components/learning/EmptyState";
import { ExerciseRunner, type RunnerResult } from "@/components/learning/exercises/ExerciseRunner";
import { GrammarCard } from "@/components/learning/GrammarCard";
import { Mascot } from "@/components/learning/Mascot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type GrammarPoint, loadGrammar } from "@/lib/content";
import { type Exercise, grammarExercises } from "@/lib/exercises";
import { shuffle } from "@/lib/random";
import { useProgress } from "@/store/progress";

export default function GrammarDetailPage() {
  const { id = "" } = useParams();
  const [items, setItems] = useState<GrammarPoint[] | null>(null);
  const [practice, setPractice] = useState<Exercise[] | null>(null);
  const [result, setResult] = useState<RunnerResult | null>(null);
  const recordAnswer = useProgress((s) => s.recordAnswer);

  useEffect(() => {
    void loadGrammar().then(setItems);
  }, []);
  useEffect(() => {
    setPractice(null);
    setResult(null);
    window.scrollTo({ top: 0 });
  }, [id]);

  const idx = items?.findIndex((g) => g.id === id) ?? -1;
  const g = items?.[idx];
  const next = useMemo(() => (items && idx >= 0 ? items[idx + 1] : undefined), [items, idx]);

  if (!items) return <Skeleton className="h-96 rounded-lg" />;
  if (!g) return <EmptyState title="Không tìm thấy điểm ngữ pháp" mood="sleepy" action={<Button asChild><Link to="/grammar">Về danh sách</Link></Button>} />;

  const start = () => {
    setResult(null);
    setPractice(shuffle(grammarExercises(g)));
  };

  if (practice && !result)
    return <ExerciseRunner exercises={practice} onAnswer={recordAnswer} onFinish={setResult} onExit={() => setPractice(null)} />;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/grammar">
          <ArrowLeft /> Ngữ pháp
        </Link>
      </Button>
      <div>
        <Badge variant="secondary">HSK {g.level}</Badge>
        <h1 className="mt-2 text-2xl font-black md:text-3xl">{g.title}</h1>
      </div>

      {result && (
        <Card className="bg-candy-mint text-candy-mint-foreground">
          <CardContent className="flex items-center gap-4 p-5">
            <Mascot className="size-16 shrink-0" />
            <div className="flex-1">
              <p className="text-lg font-black">
                Đúng {result.correct}/{result.total} câu {result.correct === result.total ? "🎉" : ""}
              </p>
              <p className="font-semibold">{result.correct === result.total ? "Bạn đã nắm chắc điểm này!" : "Đọc lại ví dụ rồi thử lần nữa nhé."}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5 md:p-6">
          <GrammarCard g={g} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={start}>
          <Dumbbell /> {result ? "Luyện lại" : `Luyện tập (${g.exercises.length} câu)`}
        </Button>
        {next && (
          <Button size="lg" variant="outline" asChild>
            <Link to={`/grammar/${next.id}`}>Điểm tiếp: {next.title}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
