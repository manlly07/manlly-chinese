import { Volume2 } from "lucide-react";
import { useState } from "react";
import type { Syllable } from "@/lib/content";
import { TONE_CLASS, type Tone } from "@/lib/pinyin";
import { canPlay, hanziFor, withTone } from "@/lib/syllables";
import { cn } from "@/lib/utils";
import { TryTone } from "./TryTone";
import { useSyllablePlayer } from "./use-syllable-player";

interface Props {
  syl: Syllable;
  /** thanh đang chọn từ bên ngoài (vd vừa bấm ô trong bảng) — để "Đọc thử" chấm đúng thanh đó */
  tone?: Tone | null;
  onTone?: (t: Tone) => void;
}

/** 4 nút thanh của một âm tiết (nghe bằng giọng người thật) + chữ đại diện + "Đọc thử" thanh vừa nghe. */
export function SyllableTones({ syl, tone: outer, onTone }: Props) {
  const play = useSyllablePlayer();
  const [inner, setInner] = useState<Tone | null>(null);
  const tone = outer ?? inner;

  const pick = (t: Tone) => {
    void play(syl, t);
    setInner(t);
    onTone?.(t);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {([1, 2, 3, 4] as Tone[]).map((t) => {
          const ok = canPlay(syl, t);
          const h = hanziFor(syl, t);
          return (
            <button
              key={t}
              type="button"
              disabled={!ok}
              onClick={() => pick(t)}
              aria-pressed={tone === t}
              aria-label={ok ? `Nghe ${withTone(syl, t)}` : `${withTone(syl, t)} — chưa có âm thanh`}
              className={cn(
                "flex min-h-20 flex-col items-center justify-center rounded-2xl border-2 bg-background p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                tone === t ? "border-primary" : "border-border/70",
                ok ? "hover:-translate-y-0.5 hover:border-primary/50" : "opacity-40",
              )}
            >
              <span className={cn("font-pinyin text-2xl font-black", TONE_CLASS[t])}>{withTone(syl, t)}</span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                {h && <span className="hanzi">{h}</span>}
                {ok ? <Volume2 className="size-3.5" aria-hidden /> : "—"}
              </span>
            </button>
          );
        })}
      </div>
      {tone && canPlay(syl, tone) && <TryTone key={`${syl.s}${tone}`} label={withTone(syl, tone)} tone={tone} />}
    </div>
  );
}
