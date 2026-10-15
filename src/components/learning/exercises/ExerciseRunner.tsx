import { ArrowRight, Flame, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Exercise, ExerciseCategory } from "@/lib/exercises";
import { playSfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { useSettings } from "@/store/settings";
import { QuestionView } from "../QuizQuestionView";
import { ChoiceView } from "./ChoiceView";
import { ListenView } from "./ListenView";
import { OrderView } from "./OrderView";

export interface RunnerResult {
  correct: number;
  total: number;
  /** id từ trả lời sai / đúng (câu từ vựng) */
  wrongWords: string[];
  rightWords: string[];
  /** khoá sổ lỗi của mọi câu sai */
  wrongRefs: string[];
  byCategory: Record<ExerciseCategory, { correct: number; total: number }>;
  maxCombo: number;
  seconds: number;
}

interface Props {
  exercises: Exercise[];
  onFinish: (r: RunnerResult) => void;
  onExit?: () => void;
  onAnswer?: (correct: boolean) => void;
  /** tiêu đề nhỏ trên thanh tiến độ (vd. "Kiểm tra chặng 1") */
  label?: string;
}

const COMBO_AT = [3, 5, 10];

/** Chạy lần lượt các câu: phản hồi ngay, combo, âm thanh, ghi sổ lỗi sai. Phím 1–4 chọn, Enter tiếp. */
export function ExerciseRunner({ exercises, onFinish, onExit, onAnswer, label }: Props) {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const [combo, setCombo] = useState(0);
  const sfxOn = useSettings((s) => s.soundEffects);
  const logMistake = useProgress((s) => s.logMistake);
  const resolveMistake = useProgress((s) => s.resolveMistake);
  const acc = useRef({ correct: 0, wrongWords: [] as string[], rightWords: [] as string[], wrongRefs: [] as string[], maxCombo: 0, cats: {} as RunnerResult["byCategory"] });
  const started = useRef(Date.now());
  const cur = exercises[i];

  const answer = (correct: boolean, given: string) => {
    if (ok !== null || !cur) return;
    setChosen(given);
    setOk(correct);
    onAnswer?.(correct);
    const a = acc.current;
    const cat = cur.kind as ExerciseCategory;
    a.cats[cat] ??= { correct: 0, total: 0 };
    a.cats[cat].total++;
    if (correct) {
      a.correct++;
      a.cats[cat].correct++;
      resolveMistake(cur.ref);
      if (cur.kind === "word") a.rightWords.push(cur.q.word.id);
      const c = combo + 1;
      setCombo(c);
      a.maxCombo = Math.max(a.maxCombo, c);
      if (sfxOn) playSfx(COMBO_AT.includes(c) ? "combo" : "correct");
    } else {
      setCombo(0);
      logMistake(cur.ref);
      a.wrongRefs.push(cur.ref);
      if (cur.kind === "word") a.wrongWords.push(cur.q.word.id);
      if (sfxOn) playSfx("wrong");
    }
  };

  const next = () => {
    if (i + 1 >= exercises.length) {
      const a = acc.current;
      if (sfxOn) playSfx("complete");
      onFinish({
        correct: a.correct,
        total: exercises.length,
        wrongWords: a.wrongWords,
        rightWords: a.rightWords,
        wrongRefs: a.wrongRefs,
        byCategory: a.cats,
        maxCombo: a.maxCombo,
        seconds: Math.round((Date.now() - started.current) / 1000),
      });
      return;
    }
    setI(i + 1);
    setChosen(null);
    setOk(null);
  };

  const options = (): string[] =>
    !cur ? [] : cur.kind === "word" ? cur.q.options.map((o) => o.key) : cur.kind === "listen" ? cur.options : cur.ex.type === "order" ? [] : cur.ex.options;
  const correctKey = (): string => (!cur ? "" : cur.kind === "word" ? cur.q.answer : cur.kind === "listen" ? cur.answer : cur.ex.answer);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!cur || (e.target as HTMLElement).closest("input, textarea")) return;
      if (ok !== null && e.key === "Enter") {
        e.preventDefault();
        next();
        return;
      }
      if (ok !== null || !/^[1-4]$/.test(e.key)) return;
      const o = options()[Number(e.key) - 1];
      if (o !== undefined) answer(o === correctKey(), o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!cur) return null;
  const showCombo = combo >= 3;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        {onExit && (
          <Button variant="ghost" size="icon" onClick={onExit} aria-label="Thoát">
            <X />
          </Button>
        )}
        <div className="flex-1 space-y-1">
          {label && <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</p>}
          <Progress value={(i / exercises.length) * 100} className={cn("h-3 transition-shadow", showCombo && "shadow-[0_0_12px_hsl(var(--chart-new)/0.7)]")} aria-label="Tiến độ" />
        </div>
        <span
          className={cn(
            "flex min-w-12 items-center justify-end gap-1 text-sm font-black",
            showCombo ? "text-chart-new" : "text-muted-foreground",
          )}
          aria-live="polite"
        >
          {showCombo ? (
            <>
              <Flame className="size-4" aria-hidden /> {combo}
            </>
          ) : (
            `${i + 1}/${exercises.length}`
          )}
        </span>
      </div>

      <div key={i}>
        {cur.kind === "word" ? (
          <QuestionView q={cur.q} chosen={chosen} onChoose={(k) => answer(k === cur.q.answer, k)} />
        ) : cur.kind === "listen" ? (
          <ListenView line={cur.line} options={cur.options} answer={cur.answer} chosen={chosen} onChoose={(o) => answer(o === cur.answer, o)} />
        ) : cur.ex.type === "order" ? (
          <OrderView ex={cur.ex} done={ok !== null} onAnswer={(c, g) => answer(c, g)} />
        ) : (
          <ChoiceView ex={cur.ex} chosen={chosen} onChoose={(o) => answer(o === correctKey(), o)} />
        )}
      </div>

      {ok !== null && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl p-4 animate-in slide-in-from-bottom-2",
            ok ? "bg-candy-mint text-candy-mint-foreground" : "bg-candy-pink text-candy-pink-foreground",
          )}
          role="status"
        >
          <p className="font-black">
            {ok ? (COMBO_AT.includes(combo) ? `🔥 ${combo} câu đúng liên tiếp!` : "Chính xác! 🎉") : "Chưa đúng — đã ghi vào sổ lỗi để ôn lại"}
          </p>
          <Button onClick={next}>
            {i + 1 >= exercises.length ? "Xem kết quả" : "Tiếp"} <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}
