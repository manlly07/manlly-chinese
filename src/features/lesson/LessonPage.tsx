import { ArrowLeft, BookOpen, Check, MessagesSquare, NotebookPen, Target, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DialoguePlayer } from "@/components/learning/DialoguePlayer";
import { EmptyState } from "@/components/learning/EmptyState";
import { ExerciseRunner } from "@/components/learning/exercises/ExerciseRunner";
import { GrammarCard } from "@/components/learning/GrammarCard";
import { HanziText } from "@/components/learning/HanziText";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePath } from "@/hooks/use-path";
import { useVocab } from "@/hooks/use-vocab";
import { type Dialogue, type GrammarPoint, loadDialogues, loadGrammar } from "@/lib/content";
import { buildLessonExercises, type Exercise } from "@/lib/exercises";
import { cn } from "@/lib/utils";
import { lessonXp } from "@/lib/xp";
import { useProgress } from "@/store/progress";
import { LessonSummary } from "./components/LessonSummary";
import { WordStep } from "./components/WordStep";

type Step = "intro" | "words" | "grammar" | "dialogue" | "practice" | "summary";
const STEP_META: Record<Exclude<Step, "summary">, { label: string; icon: typeof Target }> = {
  intro: { label: "Mục tiêu", icon: Target },
  words: { label: "Từ mới", icon: BookOpen },
  grammar: { label: "Ngữ pháp", icon: NotebookPen },
  dialogue: { label: "Hội thoại", icon: MessagesSquare },
  practice: { label: "Bài tập", icon: Trophy },
};

export default function LessonPage() {
  const { id = "" } = useParams();
  const { lessons, states } = usePath();
  const { words: allWords, loading } = useVocab();
  const [grammar, setGrammar] = useState<GrammarPoint[]>([]);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [step, setStep] = useState<Step>("intro");
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [result, setResult] = useState<{ score: number; xp: number } | null>(null);
  const completeLesson = useProgress((s) => s.completeLesson);
  const addCards = useProgress((s) => s.addCards);

  useEffect(() => {
    void loadGrammar().then(setGrammar);
    void loadDialogues().then(setDialogues);
  }, []);
  useEffect(() => {
    setStep("intro");
    setResult(null);
    setExercises(null);
    window.scrollTo({ top: 0 });
  }, [id]);

  const idx = lessons?.findIndex((l) => l.id === id) ?? -1;
  const lesson = lessons?.[idx];
  const byId = useMemo(() => new Map(allWords.map((w) => [w.id, w])), [allWords]);
  const words = useMemo(() => (lesson?.words ?? []).map((w) => byId.get(w)).filter((w) => !!w), [lesson, byId]);
  const points = useMemo(() => grammar.filter((g) => lesson?.grammar.includes(g.id)), [grammar, lesson]);
  const dialogue = dialogues.find((d) => d.id === lesson?.dialogue);

  const steps = (["intro", "words", "grammar", "dialogue", "practice"] as const).filter(
    (s) => (s !== "words" || words.length) && (s !== "grammar" || points.length) && (s !== "dialogue" || dialogue),
  );

  if (!lessons || loading) return <Skeleton className="h-96 rounded-lg" />;
  if (!lesson) return <EmptyState title="Không tìm thấy bài học" mood="sleepy" action={<Button asChild><Link to="/path">Về lộ trình</Link></Button>} />;
  if (states.get(lesson.id) === "locked")
    return (
      <EmptyState title="Bài này đang khoá" mood="sleepy" action={<Button asChild><Link to="/path">Về lộ trình</Link></Button>}>
        Hoàn thành bài trước với ít nhất 80%, hoặc làm bài kiểm tra xếp lớp để mở nhanh.
      </EmptyState>
    );

  const goNext = () => setStep(steps[steps.indexOf(step as (typeof steps)[number]) + 1] ?? "practice");
  const startPractice = () => {
    const levelPool = allWords.filter((w) => w.hsk2 === lesson.level);
    const learnedBefore = lessons.slice(0, idx).flatMap((l) => l.words).map((w) => byId.get(w)!).filter(Boolean);
    setExercises(buildLessonExercises(words, points, levelPool, learnedBefore.filter((w) => w.hsk2 === lesson.level)));
    setResult(null);
    setStep("practice");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/path">
            <ArrowLeft /> Lộ trình
          </Link>
        </Button>
        <span className="truncate text-sm font-black text-muted-foreground">
          HSK {lesson.level} · Bài {lesson.id.slice(-2)}
        </span>
      </div>

      {/* Thanh bước */}
      {step !== "summary" && (
        <nav aria-label="Các bước bài học" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
          <ol className="flex min-w-max gap-2">
            {steps.map((s, k) => {
              const Icon = STEP_META[s].icon;
              const cur = s === step;
              const passed = steps.indexOf(step as (typeof steps)[number]) > k;
              return (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => (s === "practice" ? startPractice() : setStep(s))}
                    aria-current={cur ? "step" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-black transition-colors",
                      cur ? "bg-primary text-primary-foreground" : passed ? "bg-candy-mint text-candy-mint-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {passed ? <Check className="size-4" /> : <Icon className="size-4" />}
                    {STEP_META[s].label}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {step === "intro" && (
        <div className="mx-auto max-w-xl space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-candy-pink via-candy-lilac to-candy-sky p-6">
              <h1 className="text-2xl font-black md:text-3xl">{lesson.title}</h1>
              <p className="font-bold text-foreground/70">
                {words.length} từ mới · {points.length} điểm ngữ pháp{dialogue && " · 1 hội thoại"}
              </p>
            </div>
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="mb-2 font-black">Học xong bài này, bạn có thể:</p>
                <ul className="space-y-1.5">
                  {lesson.goals.map((g) => (
                    <li key={g} className="flex items-start gap-2 font-semibold">
                      <Check className="mt-0.5 size-5 shrink-0 text-candy-mint-foreground" aria-hidden /> {g}
                    </li>
                  ))}
                </ul>
              </div>
              {words.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {words.map((w) => (
                    <span key={w.id} className="rounded-2xl bg-muted px-3 py-1.5">
                      <HanziText className="font-bold">{w.hanzi}</HanziText>
                    </span>
                  ))}
                </div>
              )}
              <Button size="lg" className="w-full" onClick={goNext}>
                Bắt đầu học
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "words" && <WordStep words={words} onDone={goNext} />}

      {step === "grammar" && (
        <div className="mx-auto max-w-2xl space-y-4">
          {points.map((g) => (
            <Card key={g.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{g.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <GrammarCard g={g} />
              </CardContent>
            </Card>
          ))}
          <Button size="lg" className="w-full" onClick={goNext}>
            {dialogue ? "Sang hội thoại" : "Làm bài tập"}
          </Button>
        </div>
      )}

      {step === "dialogue" && dialogue && (
        <div className="mx-auto max-w-2xl space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{dialogue.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <DialoguePlayer dialogue={dialogue} />
            </CardContent>
          </Card>
          <Button size="lg" className="w-full" onClick={startPractice}>
            Làm bài tập
          </Button>
        </div>
      )}

      {step === "practice" && exercises && (
        <ExerciseRunner
          exercises={exercises}
          onExit={() => setStep("intro")}
          onFinish={(r) => {
            const score = r.total ? r.correct / r.total : 1;
            completeLesson(lesson.id, score);
            addCards([...lesson.words, ...r.wrongWords]);
            setResult({ score, xp: lessonXp(score) });
            setStep("summary");
          }}
        />
      )}

      {step === "summary" && result && (
        <LessonSummary score={result.score} xp={result.xp} next={lessons[idx + 1]} newWords={words.length} onRetry={startPractice} />
      )}
    </div>
  );
}
