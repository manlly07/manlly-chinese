import { ArrowRight, X } from "lucide-react";
import { type CuteName, CuteIcon } from "@/components/learning/CuteIcon";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { HanziText } from "@/components/learning/HanziText";
import { Mascot } from "@/components/learning/Mascot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useVocab } from "@/hooks/use-vocab";
import { availableVocabLevels, type Word } from "@/lib/content";
import { buildQuiz, QUIZ_TYPES, type QuizQuestion, type QuizType } from "@/lib/quiz";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { QuestionView } from "@/components/learning/QuizQuestionView";

type Source = "all" | "learned" | `${number}`;

const QUIZ_ICON: Record<QuizType, CuteName> = {
  "hanzi-meaning": "vocab",
  "meaning-hanzi": "hanzi",
  "audio-hanzi": "listening",
  "pinyin-hanzi": "pronunciation",
  tone: "note",
};

export default function QuizPage() {
  const { words, loading } = useVocab();
  const cards = useProgress((s) => s.cards);
  const recordAnswer = useProgress((s) => s.recordAnswer);
  const addCards = useProgress((s) => s.addCards);

  const [source, setSource] = useState<Source>("1");
  const [types, setTypes] = useState<QuizType[]>(QUIZ_TYPES.map((t) => t.type));
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrong, setWrong] = useState<Word[]>([]);
  const [right, setRight] = useState(0);

  const pool = useMemo(() => {
    if (source === "all") return words;
    if (source === "learned") return words.filter((w) => cards[w.id]);
    return words.filter((w) => w.hsk2 === Number(source));
  }, [words, source, cards]);

  const start = () => {
    setQuestions(buildQuiz(pool, types, count));
    setI(0);
    setChosen(null);
    setWrong([]);
    setRight(0);
  };

  const q = questions?.[i];
  const done = questions && i >= questions.length;

  const choose = (key: string) => {
    if (!q || chosen) return;
    setChosen(key);
    const ok = key === q.answer;
    recordAnswer(ok);
    if (ok) setRight((r) => r + 1);
    else {
      setWrong((w) => [...w, q.word]);
      addCards([q.word.id]);
    }
  };
  const next = () => {
    setChosen(null);
    setI((x) => x + 1);
  };

  useEffect(() => {
    if (!q) return;
    const onKey = (e: KeyboardEvent) => {
      if (!chosen && /^[1-4]$/.test(e.key)) choose(q.options[Number(e.key) - 1]?.key);
      else if (chosen && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (loading) return <Skeleton className="h-96 rounded-lg" />;

  // Kết quả
  if (questions && done) {
    const pct = Math.round((right / questions.length) * 100);
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Mascot mood={pct >= 50 ? "happy" : "sleepy"} className="size-28 animate-wiggle" />
            <p className="text-5xl font-black text-primary">{pct}%</p>
            <p className="text-lg font-black">
              {pct === 100 ? "Tuyệt đối! 🏆" : pct >= 80 ? "Rất giỏi! 🎉" : pct >= 50 ? "Khá lắm, cố thêm chút nữa!" : "Không sao, luyện thêm là nhớ thôi 💪"}
            </p>
            <p className="font-semibold text-muted-foreground">
              Đúng {right}/{questions.length} câu · +{right * 5} XP
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={start}>Làm lại</Button>
              <Button variant="outline" onClick={() => setQuestions(null)}>
                Đổi cài đặt
              </Button>
            </div>
          </CardContent>
        </Card>
        {wrong.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Từ cần ôn lại</CardTitle>
              <p className="text-sm font-semibold text-muted-foreground">Đã tự động thêm vào Ôn tập.</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {wrong.map((w) => (
                <Link key={w.id} to={`/vocab/${encodeURIComponent(w.id)}`} className="rounded-2xl bg-candy-pink px-3 py-2 text-candy-pink-foreground">
                  <HanziText className="font-bold">{w.hanzi}</HanziText> <span className="text-sm font-bold">{w.meaning[0]}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Đang làm
  if (questions && q) {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setQuestions(null)} aria-label="Thoát">
            <X />
          </Button>
          <Progress value={(i / questions.length) * 100} className="h-3 flex-1" aria-label="Tiến độ" />
          <span className="min-w-12 text-right text-sm font-black text-muted-foreground">
            {i + 1}/{questions.length}
          </span>
        </div>
        <QuestionView key={i} q={q} chosen={chosen} onChoose={choose} />
        {chosen && (
          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-2xl p-4",
              chosen === q.answer ? "bg-candy-mint text-candy-mint-foreground" : "bg-candy-pink text-candy-pink-foreground",
            )}
          >
            <p className="font-black">{chosen === q.answer ? "Chính xác! +5 XP" : "Chưa đúng — đã thêm vào ôn tập"}</p>
            <Button onClick={next}>
              Tiếp <ArrowRight />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Cài đặt
  const toggle = (t: QuizType) => setTypes((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
  return (
    <div className="space-y-5">
      <PageHeader icon="star" title="Quiz nhanh" description="Quiz nhanh 5 dạng — từ sai tự vào ôn tập" />
      <Card>
        <CardContent className="space-y-5 p-5 md:p-6">
          <div className="space-y-2">
            <p className="font-black">Nguồn từ</p>
            <div className="flex flex-wrap gap-2">
              {availableVocabLevels().map((l) => (
                <Chip key={l} active={source === String(l)} onClick={() => setSource(`${l}`)}>
                  HSK {l}
                </Chip>
              ))}
              <Chip active={source === "all"} onClick={() => setSource("all")}>
                Tất cả
              </Chip>
              <Chip active={source === "learned"} onClick={() => setSource("learned")}>
                Từ đã học ({Object.keys(cards).length})
              </Chip>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-black">Dạng câu hỏi</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {QUIZ_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  aria-pressed={types.includes(t.type)}
                  onClick={() => toggle(t.type)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border-2 p-3 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    types.includes(t.type) ? "border-primary bg-candy-pink text-candy-pink-foreground" : "border-border/70 bg-card text-muted-foreground",
                  )}
                >
                  <CuteIcon name={QUIZ_ICON[t.type]} className="size-11" />
                  <span className="text-sm">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-black">Số câu</p>
            <div className="flex gap-2">
              {[10, 20, 30].map((n) => (
                <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                  {n} câu
                </Chip>
              ))}
            </div>
          </div>
          {pool.length < 4 ? (
            <p className="font-semibold text-muted-foreground">Cần ít nhất 4 từ để tạo quiz. Hãy học thêm hoặc chọn nguồn khác.</p>
          ) : (
            <Button size="lg" disabled={!types.length} onClick={start}>
              Bắt đầu ({Math.min(count, pool.length)} câu)
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
