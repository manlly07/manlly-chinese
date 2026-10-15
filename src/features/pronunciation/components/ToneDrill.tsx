import { RotateCcw, Volume2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PinyinText } from "@/components/learning/PinyinText";
import { useSpeech } from "@/components/learning/use-speech";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { useVocab } from "@/hooks/use-vocab";
import type { PinyinData } from "@/lib/content";
import { type Tone, TONE_CLASS, toneOf } from "@/lib/pinyin";
import { pick, sampleDistinct, shuffle } from "@/lib/random";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { ToneContour } from "./ToneContour";

interface Question {
  speak: string;
  pinyin: string;
  answer: string;
  options: string[];
}

export function ToneDrill({ data }: { data: PinyinData }) {
  const [mode, setMode] = useState<"single" | "pair">("single");
  const { words } = useVocab();
  const { say } = useSpeech();
  const recordAnswer = useProgress((s) => s.recordAnswer);
  const [q, setQ] = useState<Question | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  // từ 2 âm tiết không có thanh nhẹ — dùng cho luyện cặp thanh
  const pairs = useMemo(
    () => words.filter((w) => w.pinyin.split(" ").length === 2 && w.pinyin.split(" ").every((s) => toneOf(s) !== 5)),
    [words],
  );

  const next = useCallback(() => {
    setChosen(null);
    if (mode === "single") {
      const set = pick(data.toneSets);
      const i = Math.floor(Math.random() * 4);
      setQ({ speak: set.chars[i], pinyin: set.pinyin[i], answer: String(i + 1), options: ["1", "2", "3", "4"] });
    } else {
      if (!pairs.length) return;
      const w = pick(pairs);
      const combo = w.pinyin.split(" ").map(toneOf).join("-");
      const all = [1, 2, 3, 4].flatMap((a) => [1, 2, 3, 4].map((b) => `${a}-${b}`));
      const wrong = sampleDistinct(all, 3, (x) => x, [combo]);
      setQ({ speak: w.hanzi, pinyin: w.pinyin, answer: combo, options: shuffle([combo, ...wrong]) });
    }
  }, [mode, data.toneSets, pairs]);

  useEffect(() => {
    next();
  }, [next]);

  useEffect(() => {
    if (q) void say(q.speak);
  }, [q, say]);

  const answer = (opt: string) => {
    if (!q || chosen) return;
    setChosen(opt);
    const ok = opt === q.answer;
    recordAnswer(ok);
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  };

  // phím 1–4 chọn, Enter câu tiếp, R nghe lại
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q) return;
      if (/^[1-4]$/.test(e.key) && !chosen) answer(q.options[Number(e.key) - 1]);
      else if (e.key === "Enter" && chosen) next();
      else if (e.key.toLowerCase() === "r") void say(q.speak);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const contourOf = (t: number) => data.tones.find((x) => x.tone === t)?.contour ?? [3];
  const renderOpt = (opt: string) => (
    <span className="flex items-center gap-1">
      {opt.split("-").map((t, i) => (
        <span key={i} className="flex flex-col items-center">
          <ToneContour tone={Number(t) as Tone} contour={contourOf(Number(t))} className="h-9 w-12" />
          <span className={cn("text-xs font-black", TONE_CLASS[Number(t) as Tone])}>Thanh {t}</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Chip active={mode === "single"} onClick={() => setMode("single")}>
            Một âm tiết
          </Chip>
          <Chip active={mode === "pair"} onClick={() => setMode("pair")}>
            Cặp thanh (từ 2 chữ)
          </Chip>
        </div>
        <span className="rounded-full bg-candy-mint px-3 py-1 text-sm font-black text-candy-mint-foreground">
          Đúng {score.right}/{score.total}
        </span>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-5 p-6">
          <button
            type="button"
            onClick={() => q && void say(q.speak)}
            className="btn-pop flex size-28 items-center justify-center rounded-full bg-candy-sky text-candy-sky-foreground [--btn-shadow:var(--candy-sky-foreground)]"
            aria-label="Nghe lại (phím R)"
          >
            <Volume2 className="size-12" />
          </button>
          <p className="font-bold text-muted-foreground">{mode === "single" ? "Đây là thanh mấy?" : "Hai âm tiết là những thanh nào?"}</p>

          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {q?.options.map((opt, i) => {
              const state = !chosen ? "idle" : opt === q.answer ? "right" : opt === chosen ? "wrong" : "idle";
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => answer(opt)}
                  disabled={!!chosen}
                  className={cn(
                    "flex min-h-20 items-center justify-center rounded-2xl border-2 bg-card py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    state === "right" && "border-candy-mint-foreground bg-candy-mint",
                    state === "wrong" && "border-candy-pink-foreground bg-candy-pink",
                    state === "idle" && "border-border/70 hover:border-primary/50",
                  )}
                  aria-label={`Lựa chọn ${i + 1}: thanh ${opt.replace("-", " và ")}`}
                >
                  {renderOpt(opt)}
                </button>
              );
            })}
          </div>

          {chosen && q && (
            <div className="flex w-full flex-col items-center gap-3 text-center">
              <p className={cn("text-lg font-black", chosen === q.answer ? "text-candy-mint-foreground" : "text-candy-pink-foreground")}>
                {chosen === q.answer ? "Chính xác! 🎉" : "Chưa đúng — nghe lại nhé"}
              </p>
              <p className="flex items-center gap-2">
                <span className="hanzi text-2xl">{q.speak}</span>
                <PinyinText pinyin={q.pinyin} className="text-xl font-black" />
              </p>
              <Button onClick={next}>
                <RotateCcw /> Câu tiếp <kbd className="hidden text-xs opacity-70 md:inline">Enter</kbd>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-xs font-semibold text-muted-foreground">Phím 1–4 để chọn · R nghe lại · Enter câu tiếp</p>
    </div>
  );
}
