import { Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Syllable } from "@/lib/content";
import { TONE_CLASS, type Tone } from "@/lib/pinyin";
import { hanziFor, indexSyllables, spellNote, syllableKey, withTone } from "@/lib/syllables";
import { cn } from "@/lib/utils";
import { useSpeech } from "./use-speech";

interface Props {
  syllables: Syllable[];
  /** thanh mẫu/vận mẫu được phép chọn (thứ tự hiển thị) */
  initials: string[];
  finals: string[];
  /** có ô "không phụ âm đầu" */
  zero?: boolean;
  /** chọn sẵn, vd ["ch", "a"] */
  initial?: [string, string];
  className?: string;
}

const NONE = "";

function Tile({ label, active, dim, onClick }: { label: string; active: boolean; dim: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "font-pinyin min-h-11 min-w-11 rounded-xl border-2 px-2.5 text-lg font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border/70 bg-card hover:-translate-y-0.5 hover:border-primary/50",
        dim && !active && "opacity-40",
      )}
    >
      {label || "∅"}
    </button>
  );
}

/** Bảng ghép vần: chọn phụ âm đầu + vần → xem cách viết và nghe đủ 4 thanh. Ô mờ = không ghép được với lựa chọn hiện tại. */
export function SyllableBlender({ syllables, initials, finals, zero, initial, className }: Props) {
  const { say } = useSpeech();
  const index = useMemo(() => indexSyllables(syllables), [syllables]);
  const [ini, setIni] = useState(initial?.[0] ?? initials[0] ?? NONE);
  const [fin, setFin] = useState(initial?.[1] ?? finals[0] ?? "");
  const syl = index.get(syllableKey(ini, fin));
  const note = syl ? spellNote(ini, fin) : null;
  const iniList = zero ? [NONE, ...initials] : initials;

  const play = (s: Syllable, t: Tone) => {
    const h = hanziFor(s, t);
    if (h) void say(h);
  };
  const pickIni = (x: string) => {
    setIni(x);
    const s = index.get(syllableKey(x, fin));
    if (s) play(s, ([1, 2, 3, 4] as Tone[]).find((t) => hanziFor(s, t)) ?? 1);
  };
  const pickFin = (x: string) => {
    setFin(x);
    const s = index.get(syllableKey(ini, x));
    if (s) play(s, ([1, 2, 3, 4] as Tone[]).find((t) => hanziFor(s, t)) ?? 1);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 text-center shadow-soft">
        <p className="flex flex-wrap items-center justify-center gap-2 font-pinyin text-3xl font-black md:text-4xl" aria-live="polite">
          <span className="rounded-2xl bg-candy-sky px-3 py-1 text-candy-sky-foreground">{ini || "∅"}</span>
          <span className="text-muted-foreground">+</span>
          <span className="rounded-2xl bg-candy-pink px-3 py-1 text-candy-pink-foreground">{fin}</span>
          <span className="text-muted-foreground">=</span>
          <span className={cn(syl ? "text-primary" : "text-muted-foreground/50 line-through")}>{syl ? syl.s : `${ini}${fin}`}</span>
        </p>
        {syl ? (
          <>
            {note && <p className="mt-2 text-sm font-bold text-candy-yellow-foreground">💡 {note}</p>}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as Tone[]).map((t) => {
                const h = hanziFor(syl, t);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!h}
                    onClick={() => play(syl, t)}
                    aria-label={h ? `Nghe ${withTone(syl, t)}` : `${withTone(syl, t)} — không có chữ thông dụng`}
                    className={cn(
                      "flex min-h-20 flex-col items-center justify-center rounded-2xl border-2 border-border/70 bg-background p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      h ? "hover:-translate-y-0.5 hover:border-primary/50" : "opacity-40",
                    )}
                  >
                    <span className={cn("font-pinyin text-2xl font-black", TONE_CLASS[t])}>{withTone(syl, t)}</span>
                    {h ? (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span className="hanzi">{h}</span> <Volume2 className="size-3.5" aria-hidden />
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">—</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm font-bold text-muted-foreground">Tiếng Trung phổ thông không có âm tiết này — thử ghép mảnh khác nhé.</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-black text-muted-foreground">Phụ âm đầu (thanh mẫu)</p>
        <div className="flex flex-wrap gap-2">
          {iniList.map((x) => (
            <Tile key={x || "none"} label={x} active={x === ini} dim={!index.has(syllableKey(x, fin))} onClick={() => pickIni(x)} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-black text-muted-foreground">Vần (vận mẫu)</p>
        <div className="flex flex-wrap gap-2">
          {finals.map((x) => (
            <Tile key={x} label={x} active={x === fin} dim={!index.has(syllableKey(ini, x))} onClick={() => pickFin(x)} />
          ))}
        </div>
      </div>
    </div>
  );
}
