import { useEffect } from "react";
import { HanziText } from "@/components/learning/HanziText";
import { PinyinText } from "@/components/learning/PinyinText";
import { SpeakButton } from "@/components/learning/SpeakButton";
import { useSpeech } from "@/components/learning/use-speech";
import { Badge } from "@/components/ui/badge";
import type { Word } from "@/lib/content";
import { cn } from "@/lib/utils";
import { useSettings } from "@/store/settings";
import { Volume2 } from "lucide-react";

interface FlashcardProps {
  word: Word;
  flipped: boolean;
  isNew: boolean;
  onFlip: () => void;
}

export function Flashcard({ word, flipped, isNew, onFlip }: FlashcardProps) {
  const front = useSettings((s) => s.reviewFront);
  const autoSpeak = useSettings((s) => s.autoSpeak);
  const showHanViet = useSettings((s) => s.showHanViet);
  const { say } = useSpeech();

  // mặt trước "âm thanh" → đọc ngay; còn lại đọc khi lật (nếu bật)
  useEffect(() => {
    if (front === "audio" && !flipped) void say(word.hanzi);
    else if (flipped && autoSpeak) void say(word.hanzi);
  }, [flipped, word.id, front, autoSpeak, say, word.hanzi]);

  const ex = word.examples[0];

  return (
    <div className="flip-card h-[22rem] w-full md:h-[24rem]">
      <div className={cn("flip-inner size-full", flipped && "flipped")}>
        {/* Mặt trước */}
        <button
          type="button"
          onClick={onFlip}
          aria-label="Lật thẻ (phím cách)"
          className="flip-face flex flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isNew && <Badge className="absolute left-5 top-5">Từ mới</Badge>}
          {front === "hanzi" && <HanziText variant="card">{word.hanzi}</HanziText>}
          {front === "meaning" && <p className="text-center text-3xl font-black">{word.meaning.join("; ")}</p>}
          {front === "audio" && (
            <span className="flex size-28 items-center justify-center rounded-full bg-candy-sky text-candy-sky-foreground">
              <Volume2 className="size-12" aria-hidden />
            </span>
          )}
          <span className="text-sm font-bold text-muted-foreground">Chạm để lật · phím cách</span>
        </button>

        {/* Mặt sau */}
        <div className="flip-face flip-back flex flex-col items-center justify-center gap-2 overflow-y-auto rounded-[1.75rem] border border-border/70 bg-card p-6 text-center shadow-soft">
          <HanziText variant="card">{word.hanzi}</HanziText>
          <PinyinText pinyin={word.pinyin} className="text-2xl font-extrabold" />
          {showHanViet && word.hanViet && <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{word.hanViet}</p>}
          <p className="text-xl font-extrabold">{word.meaning.join("; ")}</p>
          {ex && (
            <div className="mt-2 w-full max-w-md rounded-2xl bg-muted/70 p-3 text-left">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <HanziText className="font-bold">{ex.zh}</HanziText>
                  <p className="text-sm font-semibold text-muted-foreground">{ex.vi}</p>
                </div>
                <SpeakButton text={ex.zh} label="Nghe câu ví dụ" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
