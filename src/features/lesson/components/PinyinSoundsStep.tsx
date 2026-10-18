import { ChevronRight, Volume2 } from "lucide-react";
import { HanziText } from "@/components/learning/HanziText";
import { PinyinText } from "@/components/learning/PinyinText";
import { useSpeech } from "@/components/learning/use-speech";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PinyinData, PinyinSound, PinyinSpec } from "@/lib/content";
import { TONE_CLASS, type Tone } from "@/lib/pinyin";
import { cn } from "@/lib/utils";

function SoundCard({ s, tone }: { s: PinyinSound; tone: "sky" | "pink" }) {
  const { say } = useSpeech();
  return (
    <button
      type="button"
      onClick={() => void say(s.example.hanzi)}
      className="flex w-full items-start gap-4 rounded-2xl border-2 border-border/70 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className={cn(
          "flex min-w-16 items-center justify-center rounded-2xl px-3 py-2 font-pinyin text-3xl font-black",
          tone === "sky" ? "bg-candy-sky text-candy-sky-foreground" : "bg-candy-pink text-candy-pink-foreground",
        )}
      >
        {s.py}
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block font-semibold">{s.tip}</span>
        <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          Ví dụ: <HanziText className="text-base text-foreground">{s.example.hanzi}</HanziText>
          <PinyinText pinyin={s.example.pinyin} />
          <Volume2 className="size-4" aria-hidden />
        </span>
      </span>
    </button>
  );
}

/** Bước "Âm mới" của bài pinyin: thanh điệu (bài đầu), từng phụ âm đầu / vần mới với mẹo so với tiếng Việt, biến điệu (bài cuối). */
export function PinyinSoundsStep({ spec, data, onDone }: { spec: PinyinSpec; data: PinyinData; onDone: () => void }) {
  const { say } = useSpeech();
  const initials = spec.initials.map((p) => data.initials.find((x) => x.py === p)).filter((x): x is PinyinSound => !!x);
  const finals = spec.finals.map((p) => data.finals.find((x) => x.py === p)).filter((x): x is PinyinSound => !!x);
  const ma = data.toneSets[0];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {spec.tones && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">4 thanh điệu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold text-muted-foreground">
              Cùng một âm “{ma.base}” nhưng đổi thanh là đổi nghĩa — giống ma, má, mả, mạ trong tiếng Việt. Bấm từng ô để nghe.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {data.tones
                .filter((t) => t.tone <= 4)
                .map((t, i) => (
                  <button
                    key={t.tone}
                    type="button"
                    onClick={() => void say(ma.chars[i])}
                    className="flex flex-col items-center gap-1 rounded-2xl border-2 border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className={cn("font-pinyin text-3xl font-black", TONE_CLASS[t.tone as Tone])}>{ma.pinyin[i]}</span>
                    <HanziText className="text-lg">{ma.chars[i]}</HanziText>
                    <span className="text-xs font-bold text-muted-foreground">{ma.meaning[i]}</span>
                  </button>
                ))}
            </div>
            <ul className="space-y-1.5 text-sm font-semibold">
              {data.tones
                .filter((t) => t.tone <= 4)
                .map((t) => (
                  <li key={t.tone}>
                    <span className={cn("font-black", TONE_CLASS[t.tone as Tone])}>
                      {t.name} {t.shape}
                    </span>{" "}
                    — {t.desc}
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {initials.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-black">Phụ âm đầu mới</h2>
          {initials.map((s) => (
            <SoundCard key={s.py} s={s} tone="sky" />
          ))}
        </section>
      )}
      {finals.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-black">Vần mới</h2>
          {finals.map((s) => (
            <SoundCard key={s.py} s={s} tone="pink" />
          ))}
        </section>
      )}

      {spec.sandhi && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Biến điệu — đọc khác cách viết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.sandhi.map((r) => (
              <div key={r.title} className="space-y-2">
                <p className="font-black">{r.title}</p>
                <p className="text-sm font-semibold text-muted-foreground">{r.explain}</p>
                <div className="flex flex-wrap gap-2">
                  {r.examples.map((e) => (
                    <button
                      key={e.hanzi}
                      type="button"
                      onClick={() => void say(e.hanzi)}
                      className="rounded-2xl bg-muted px-3 py-2 text-left transition-colors hover:bg-muted/70"
                    >
                      <HanziText className="font-bold">{e.hanzi}</HanziText>
                      <span className="block text-xs font-semibold">
                        <PinyinText pinyin={e.pinyin} /> → đọc <PinyinText pinyin={e.actual} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {spec.review && !spec.sandhi && (
        <p className="rounded-2xl bg-muted/70 p-4 font-semibold">Bài này ôn lại toàn bộ phụ âm đầu và vần đã học. Sang bước ghép vần để chơi thử nhé!</p>
      )}

      <p className="text-center text-sm font-bold text-muted-foreground">🗣️ Bấm từng thẻ, nghe và đọc to theo 2–3 lần</p>
      <Button size="lg" className="w-full" onClick={onDone}>
        Sang ghép vần <ChevronRight />
      </Button>
    </div>
  );
}
