import { Check, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HanziText } from "@/components/learning/HanziText";
import { useSpeech } from "@/components/learning/use-speech";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import type { Dialogue } from "@/lib/content";
import { checkDictation } from "@/lib/dictation";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";

const RATES = [
  { v: 0.6, label: "Chậm" },
  { v: 0.85, label: "Vừa" },
  { v: 1, label: "Nhanh" },
];

/** Nghe từng câu rồi gõ lại bằng chữ Hán hoặc pinyin. */
export function Dictation({ dialogue }: { dialogue: Dialogue }) {
  const { say } = useSpeech();
  const recordAnswer = useProgress((s) => s.recordAnswer);
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [res, setRes] = useState<ReturnType<typeof checkDictation> | null>(null);
  const [right, setRight] = useState(0);
  const [rate, setRate] = useState(0.85);
  const input = useRef<HTMLInputElement>(null);
  const line = dialogue.lines[i];
  const finished = i >= dialogue.lines.length;

  useEffect(() => {
    if (line) void say(line.zh, { rate });
    input.current?.focus();
    // chỉ đọc khi sang câu mới (không phụ thuộc rate/say để tránh đọc lại khi đổi tốc độ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const check = () => {
    if (!line || !text.trim() || res) return;
    const r = checkDictation(text, line.zh, line.py);
    setRes(r);
    recordAnswer(r.ok);
    if (r.ok) setRight((n) => n + 1);
  };
  const next = () => {
    setI((n) => n + 1);
    setText("");
    setRes(null);
  };

  if (finished)
    return (
      <div className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-soft">
        <p className="text-4xl font-black text-primary">
          {right}/{dialogue.lines.length}
        </p>
        <p className="font-bold">câu chép đúng</p>
        <Button
          onClick={() => {
            setI(0);
            setRight(0);
          }}
        >
          <RotateCcw /> Làm lại
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {RATES.map((r) => (
            <Chip key={r.v} active={rate === r.v} onClick={() => setRate(r.v)}>
              {r.label}
            </Chip>
          ))}
        </div>
        <span className="text-sm font-black text-muted-foreground">
          Câu {i + 1}/{dialogue.lines.length} · đúng {right}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-soft">
        <button
          type="button"
          onClick={() => void say(line.zh, { rate })}
          aria-label="Nghe lại câu"
          className="btn-pop flex size-24 items-center justify-center rounded-full bg-candy-sky text-candy-sky-foreground [--btn-shadow:var(--candy-sky-foreground)]"
        >
          <Volume2 className="size-10" />
        </button>
        <p className="text-sm font-bold text-muted-foreground">{line.speaker} nói gì? Gõ chữ Hán hoặc pinyin (không cần dấu).</p>
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (res) next();
            else check();
          }}
        >
          <Input
            ref={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!!res}
            placeholder="vd. ni hao / 你好"
            aria-label="Câu bạn nghe được"
            lang="zh-CN"
            autoComplete="off"
            className="h-12 rounded-full text-base"
          />
          <Button type="submit" size="lg" disabled={!text.trim() && !res}>
            {res ? "Tiếp" : <Check />}
          </Button>
        </form>
        {res && (
          <div className={cn("w-full rounded-2xl p-4", res.ok ? "bg-candy-mint text-candy-mint-foreground" : "bg-candy-pink text-candy-pink-foreground")}>
            <p className="font-black">{res.ok ? "Chính xác! 🎉" : "Chưa đúng — đáp án:"}</p>
            <HanziText className="block font-bold">{line.zh}</HanziText>
            <p className="font-pinyin text-sm font-semibold">{line.py}</p>
            <p className="text-sm font-semibold text-foreground/80">{line.vi}</p>
          </div>
        )}
      </div>
    </div>
  );
}
