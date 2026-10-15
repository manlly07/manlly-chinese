import { Volume2 } from "lucide-react";
import { useEffect } from "react";
import type { DialogueLine } from "@/lib/content";
import { cn } from "@/lib/utils";
import { HanziText } from "../HanziText";
import { useSpeech } from "../use-speech";

interface Props {
  line: DialogueLine;
  options: string[];
  answer: string;
  chosen: string | null;
  onChoose: (opt: string) => void;
}

/** Nghe một câu → chọn nghĩa tiếng Việt. */
export function ListenView({ line, options, answer, chosen, onChoose }: Props) {
  const { say } = useSpeech();
  useEffect(() => {
    void say(line.zh);
  }, [line.zh, say]);

  return (
    <div className="space-y-5">
      <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-border/70 bg-card p-6 text-center shadow-soft">
        <p className="text-sm font-bold text-muted-foreground">Nghe câu này nghĩa là gì?</p>
        <button
          type="button"
          onClick={() => void say(line.zh)}
          aria-label="Nghe lại"
          className="btn-pop flex size-24 items-center justify-center rounded-full bg-candy-sky text-candy-sky-foreground [--btn-shadow:var(--candy-sky-foreground)]"
        >
          <Volume2 className="size-10" />
        </button>
        <button type="button" onClick={() => void say(line.zh, { rate: 0.6 })} className="text-sm font-bold text-primary hover:underline">
          🐢 Nghe chậm
        </button>
        {chosen && (
          <div>
            <HanziText className="block font-bold">{line.zh}</HanziText>
            <p className="font-pinyin text-sm font-semibold text-muted-foreground">{line.py}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3">
        {options.map((o, i) => {
          const state = !chosen ? "idle" : o === answer ? "right" : o === chosen ? "wrong" : "dim";
          return (
            <button
              key={o}
              type="button"
              disabled={!!chosen}
              onClick={() => onChoose(o)}
              className={cn(
                "relative flex min-h-14 items-center rounded-2xl border-2 bg-card px-10 py-3 text-left font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                state === "idle" && "border-border/70 hover:-translate-y-0.5 hover:border-primary/50",
                state === "right" && "border-candy-mint-foreground bg-candy-mint text-candy-mint-foreground",
                state === "wrong" && "border-candy-pink-foreground bg-candy-pink text-candy-pink-foreground",
                state === "dim" && "border-border/50 opacity-50",
              )}
            >
              <kbd className="absolute left-3.5 text-[11px] font-black text-muted-foreground">{i + 1}</kbd>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
