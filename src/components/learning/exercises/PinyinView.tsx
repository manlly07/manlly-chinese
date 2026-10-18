import { Check, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PinyinQuestion } from "@/lib/pinyin-drill";
import { TONE_CLASS } from "@/lib/pinyin";
import { hanziFor, spell, spellNote, withTone } from "@/lib/syllables";
import { cn } from "@/lib/utils";
import { HanziText } from "../HanziText";
import { useSpeech } from "../use-speech";

interface Props {
  q: PinyinQuestion;
  chosen: string | null;
  onChoose: (given: string, correct: boolean) => void;
}

const PROMPT: Record<PinyinQuestion["type"], string> = {
  initial: "Nghe và chọn phụ âm đầu",
  final: "Nghe và chọn vần",
  syllable: "Nghe và chọn âm tiết đúng",
  tone: "Nghe và chọn thanh điệu",
  build: "Nghe rồi tự ghép âm tiết",
  spell: "Ghép hai mảnh — viết thế nào cho đúng?",
};

function OptionButton({ label, index, state, onClick, big }: { label: string; index: number; state: string; onClick: () => void; big?: boolean }) {
  return (
    <button
      type="button"
      disabled={state !== "idle"}
      onClick={onClick}
      className={cn(
        "relative flex min-h-16 items-center justify-center rounded-2xl border-2 bg-card p-3 font-pinyin font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        big ? "text-3xl" : "text-2xl",
        state === "idle" && "border-border/70 hover:-translate-y-0.5 hover:border-primary/50",
        state === "right" && "border-candy-mint-foreground bg-candy-mint text-candy-mint-foreground",
        state === "wrong" && "border-candy-pink-foreground bg-candy-pink text-candy-pink-foreground",
        state === "dim" && "border-border/50 opacity-50",
      )}
    >
      <kbd className="absolute left-2.5 top-2 hidden font-sans text-[10px] font-black text-muted-foreground md:block">{index + 1}</kbd>
      {label || "∅"}
    </button>
  );
}

/** Bài tập pinyin: nghe-chọn (phụ âm đầu / vần / âm tiết / thanh), tự ghép âm tiết, và viết đúng quy tắc. */
export function PinyinView({ q, chosen, onChoose }: Props) {
  const { say } = useSpeech();
  const hanzi = q.type === "spell" ? "" : hanziFor(q.syl, q.tone);
  const [ini, setIni] = useState<string | null>(null);
  const [fin, setFin] = useState<string | null>(null);

  useEffect(() => {
    if (hanzi) void say(hanzi);
  }, [hanzi, say]);

  const stateOf = (o: string, answer: string) => (!chosen ? "idle" : o === answer ? "right" : o === chosen ? "wrong" : "dim");

  return (
    <div className="space-y-5">
      <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-border/70 bg-card p-6 text-center shadow-soft">
        <p className="text-sm font-bold text-muted-foreground">{PROMPT[q.type]}</p>
        {q.type === "spell" ? (
          <p className="flex flex-wrap items-center justify-center gap-2 font-pinyin text-3xl font-black">
            <span className="rounded-2xl bg-candy-sky px-3 py-1 text-candy-sky-foreground">{q.parts[0] || "∅"}</span>
            <span className="text-muted-foreground">+</span>
            <span className="rounded-2xl bg-candy-pink px-3 py-1 text-candy-pink-foreground">{q.parts[1]}</span>
            <span className="text-muted-foreground">=</span>
            <span className="text-primary">{chosen ? q.answer : "?"}</span>
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void say(hanzi)}
              aria-label="Nghe lại"
              className="btn-pop flex size-24 items-center justify-center rounded-full bg-candy-sky text-candy-sky-foreground [--btn-shadow:var(--candy-sky-foreground)]"
            >
              <Volume2 className="size-10" />
            </button>
            <button type="button" onClick={() => void say(hanzi, { rate: 0.6 })} className="text-sm font-bold text-primary hover:underline">
              🐢 Nghe chậm
            </button>
          </>
        )}
        {chosen && q.type !== "spell" && (
          <div className="space-y-1">
            <p className="font-pinyin text-xl font-black">
              <span className="text-candy-sky-foreground">{q.syl.i || "∅"}</span> + <span className="text-candy-pink-foreground">{q.syl.f}</span> →{" "}
              <span className={TONE_CLASS[q.tone]}>{withTone(q.syl, q.tone)}</span>
              <HanziText className="ml-2 text-xl">{hanzi}</HanziText>
            </p>
            {spellNote(q.syl.i, q.syl.f) && <p className="text-xs font-bold text-muted-foreground">💡 {spellNote(q.syl.i, q.syl.f)}</p>}
          </div>
        )}
        {chosen && q.type === "spell" && <p className="text-sm font-bold text-muted-foreground">💡 {q.explain}</p>}
      </div>

      {q.type === "build" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-black text-muted-foreground">Phụ âm đầu</p>
            <div className="grid grid-cols-4 gap-2">
              {q.initials.map((o) => (
                <button
                  key={o}
                  type="button"
                  disabled={!!chosen}
                  aria-pressed={ini === o}
                  onClick={() => setIni(o)}
                  className={cn(
                    "min-h-14 rounded-2xl border-2 bg-card font-pinyin text-2xl font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    chosen && o === q.syl.i ? "border-candy-mint-foreground bg-candy-mint text-candy-mint-foreground" : ini === o ? "border-primary bg-candy-sky text-candy-sky-foreground" : "border-border/70",
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-black text-muted-foreground">Vần</p>
            <div className="grid grid-cols-4 gap-2">
              {q.finals.map((o) => (
                <button
                  key={o}
                  type="button"
                  disabled={!!chosen}
                  aria-pressed={fin === o}
                  onClick={() => setFin(o)}
                  className={cn(
                    "min-h-14 rounded-2xl border-2 bg-card font-pinyin text-2xl font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    chosen && o === q.syl.f ? "border-candy-mint-foreground bg-candy-mint text-candy-mint-foreground" : fin === o ? "border-primary bg-candy-pink text-candy-pink-foreground" : "border-border/70",
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          {!chosen && (
            <Button
              size="lg"
              className="w-full"
              disabled={ini === null || fin === null}
              onClick={() => onChoose(`${ini}|${fin}`, `${ini}|${fin}` === q.answer)}
            >
              <Check /> {ini && fin ? `Kiểm tra: ${spell(ini, fin)}` : "Chọn đủ hai mảnh"}
            </Button>
          )}
        </div>
      ) : (
        <div className={cn("grid gap-3", q.type === "tone" || q.type === "syllable" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
          {q.options.map((o, i) => (
            <OptionButton
              key={o}
              index={i}
              big={q.type === "initial" || q.type === "final"}
              label={o}
              state={stateOf(o, q.answer)}
              onClick={() => onChoose(o, o === q.answer)}
            />
          ))}
        </div>
      )}
      {q.type === "tone" && !chosen && (
        <p className="text-center text-xs font-bold text-muted-foreground">ˉ ngang cao · ˊ đi lên · ˇ xuống rồi lên · ˋ đi xuống</p>
      )}
    </div>
  );
}
