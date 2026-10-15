import { Volume2 } from "lucide-react";
import { useEffect } from "react";
import { HanziText } from "@/components/learning/HanziText";
import { PinyinText } from "@/components/learning/PinyinText";
import { useSpeech } from "@/components/learning/use-speech";
import { stripTone } from "@/lib/pinyin";
import type { QuizOption, QuizQuestion } from "@/lib/quiz";
import { cn } from "@/lib/utils";

const PROMPT: Record<QuizQuestion["type"], string> = {
  "hanzi-meaning": "Từ này nghĩa là gì?",
  "meaning-hanzi": "Chọn chữ Hán đúng",
  "audio-hanzi": "Bạn nghe thấy từ nào?",
  "pinyin-hanzi": "Pinyin này là chữ nào?",
  tone: "Chọn pinyin có thanh điệu đúng",
};

function OptionLabel({ o }: { o: QuizOption }) {
  if (o.kind === "hanzi") return <HanziText variant="list" className="text-3xl">{o.label}</HanziText>;
  if (o.kind === "pinyin") return <PinyinText pinyin={o.label} colored={false} className="text-xl font-black" />;
  return <span className="font-bold">{o.label}</span>;
}

interface Props {
  q: QuizQuestion;
  chosen: string | null;
  onChoose: (key: string) => void;
}

export function QuestionView({ q, chosen, onChoose }: Props) {
  const { say } = useSpeech();
  const w = q.word;

  useEffect(() => {
    if (q.type === "audio-hanzi") void say(w.hanzi);
  }, [q, say, w.hanzi]);

  useEffect(() => {
    if (chosen && q.type !== "audio-hanzi") void say(w.hanzi);
  }, [chosen, q.type, say, w.hanzi]);

  return (
    <div className="space-y-5">
      <div className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-[1.75rem] border border-border/70 bg-card p-6 text-center shadow-soft">
        <p className="text-sm font-bold text-muted-foreground">{PROMPT[q.type]}</p>
        {(q.type === "hanzi-meaning" || q.type === "tone") && <HanziText variant="card" className="md:text-7xl">{w.hanzi}</HanziText>}
        {q.type === "tone" && <p className="font-pinyin text-xl font-black tracking-wide text-muted-foreground">{w.pinyin.split(" ").map(stripTone).join(" ")}</p>}
        {q.type === "meaning-hanzi" && <p className="text-3xl font-black">{w.meaning.slice(0, 2).join("; ")}</p>}
        {q.type === "pinyin-hanzi" && <PinyinText pinyin={w.pinyin} className="text-4xl font-black" />}
        {q.type === "audio-hanzi" && (
          <button
            type="button"
            onClick={() => void say(w.hanzi)}
            aria-label="Nghe lại"
            className="btn-pop flex size-24 items-center justify-center rounded-full bg-candy-sky text-candy-sky-foreground [--btn-shadow:var(--candy-sky-foreground)]"
          >
            <Volume2 className="size-10" />
          </button>
        )}
        {chosen && q.type !== "pinyin-hanzi" && q.type !== "tone" && (
          <p className="text-sm font-bold">
            <span className="hanzi text-base">{w.hanzi}</span> · <PinyinText pinyin={w.pinyin} /> · {w.meaning[0]}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((o, i) => {
          const state = !chosen ? "idle" : o.key === q.answer ? "right" : o.key === chosen ? "wrong" : "dim";
          return (
            <button
              key={o.key}
              type="button"
              disabled={!!chosen}
              onClick={() => onChoose(o.key)}
              className={cn(
                "relative flex min-h-20 items-center justify-center rounded-2xl border-2 bg-card p-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                state === "idle" && "border-border/70 hover:-translate-y-0.5 hover:border-primary/50",
                state === "right" && "border-candy-mint-foreground bg-candy-mint text-candy-mint-foreground",
                state === "wrong" && "animate-[wiggle_0.3s_ease-in-out_2] border-candy-pink-foreground bg-candy-pink text-candy-pink-foreground",
                state === "dim" && "border-border/50 opacity-50",
              )}
            >
              <kbd className="absolute left-2.5 top-2 hidden text-[10px] font-black text-muted-foreground md:block">{i + 1}</kbd>
              <OptionLabel o={o} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
