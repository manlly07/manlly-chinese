import { HanziText } from "@/components/learning/HanziText";
import { PinyinText } from "@/components/learning/PinyinText";
import { useSpeech } from "@/components/learning/use-speech";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PinyinData } from "@/lib/content";
import { TONE_CLASS } from "@/lib/pinyin";
import { cn } from "@/lib/utils";
import { ToneContour } from "./ToneContour";

export function TonesTab({ data }: { data: PinyinData }) {
  const { say } = useSpeech();
  const ma = data.toneSets[0];
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.tones.map((t) => (
          <Card key={t.tone}>
            <CardContent className="flex gap-4 p-4">
              <ToneContour tone={t.tone} contour={t.contour} className="shrink-0" />
              <div className="min-w-0">
                <p className={cn("text-lg font-black", TONE_CLASS[t.tone])}>
                  {t.name} <span aria-hidden>{t.shape}</span>
                </p>
                <p className="text-sm font-semibold text-muted-foreground">{t.desc}</p>
                {t.tone <= 4 && (
                  <button type="button" onClick={() => void say(ma.chars[t.tone - 1])} className="mt-1 text-sm font-bold text-primary hover:underline">
                    Nghe: {ma.pinyin[t.tone - 1]} ({ma.chars[t.tone - 1]})
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Bốn thanh của cùng một âm</CardTitle>
          <p className="text-sm font-semibold text-muted-foreground">Chạm vào từng chữ để nghe — để ý giọng lên xuống khác nhau.</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.toneSets.map((set) => (
            <div key={set.base} className="grid grid-cols-[3rem_repeat(4,1fr)] items-center gap-2">
              <span className="text-sm font-black text-muted-foreground">{set.base}</span>
              {set.chars.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => void say(c)}
                  className="flex flex-col items-center rounded-2xl bg-muted/70 px-1 py-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Nghe ${set.pinyin[i]} — ${set.meaning[i]}`}
                >
                  <HanziText variant="list" className="text-2xl md:text-3xl">
                    {c}
                  </HanziText>
                  <PinyinText pinyin={set.pinyin[i]} className="text-sm font-bold" />
                  <span className="hidden text-[11px] font-semibold text-muted-foreground sm:block">{set.meaning[i]}</span>
                </button>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
