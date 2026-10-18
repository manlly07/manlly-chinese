import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { CharParts } from "@/components/learning/CharParts";
import { HanziText } from "@/components/learning/HanziText";
import { PinyinText } from "@/components/learning/PinyinText";
import { SpeakButton } from "@/components/learning/SpeakButton";
import { useSpeech } from "@/components/learning/use-speech";
import { Button } from "@/components/ui/button";
import { hanChars, type Word } from "@/lib/content";
import type { HanziParts } from "@/lib/hanzi-parts";
import { cn } from "@/lib/utils";
import { useSettings } from "@/store/settings";

interface Props {
  words: Word[];
  onDone: () => void;
  /** cấu tạo chữ — hiện "chữ = bộ + bộ" dưới mỗi từ */
  hp?: HanziParts | null;
  /** bộ vừa học ở bước trước — tô nổi */
  newParts?: Set<string>;
  doneLabel?: string;
}

/** Giới thiệu từng từ mới: nghe → nhắc lại, kèm cấu tạo từng chữ. */
export function WordStep({ words, onDone, hp, newParts, doneLabel = "Sang ngữ pháp" }: Props) {
  const [i, setI] = useState(0);
  const { say } = useSpeech();
  const showHanViet = useSettings((s) => s.showHanViet);
  const w = words[i];

  useEffect(() => {
    if (w) void say(w.hanzi);
  }, [w, say]);

  if (!w) return null;
  const ex = w.examples[0];
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex justify-center gap-1.5" aria-label={`Từ ${i + 1}/${words.length}`}>
        {words.map((x, k) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setI(k)}
            aria-label={`Từ ${k + 1}`}
            className={cn("h-2.5 rounded-full transition-all", k === i ? "w-6 bg-primary" : k < i ? "w-2.5 bg-primary/50" : "w-2.5 bg-muted")}
          />
        ))}
      </div>
      <div className="space-y-3 rounded-[1.75rem] border border-border/70 bg-card p-6 text-center shadow-soft">
        <HanziText variant="card">{w.hanzi}</HanziText>
        <div>
          <PinyinText pinyin={w.pinyin} className="text-2xl font-extrabold" />
        </div>
        {showHanViet && w.hanViet && <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{w.hanViet}</p>}
        <p className="text-xl font-extrabold">{w.meaning.join("; ")}</p>
        <SpeakButton text={w.hanzi} size="default" variant="secondary" label="Nghe lại" />
        {hp && hanChars(w.hanzi).some((c) => hp.chars.get(c)?.parts.length) && (
          <div className="space-y-1.5 rounded-2xl border border-dashed border-border p-3 text-left">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Cấu tạo chữ</p>
            {hanChars(w.hanzi).map((c, k) => (
              <CharParts key={`${c}-${k}`} char={c} hp={hp} compact highlight={newParts} />
            ))}
          </div>
        )}
        {ex && (
          <div className="flex items-start gap-2 rounded-2xl bg-muted/70 p-3 text-left">
            <div className="min-w-0 flex-1">
              <HanziText className="font-bold">{ex.zh}</HanziText>
              <p className="font-pinyin text-sm font-semibold text-muted-foreground">{ex.py}</p>
              <p className="text-sm font-semibold">{ex.vi}</p>
            </div>
            <SpeakButton text={ex.zh} label="Nghe câu ví dụ" />
          </div>
        )}
        <p className="text-sm font-bold text-muted-foreground">🗣️ Nghe và đọc to theo 2–3 lần</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="lg" disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Từ trước">
          <ChevronLeft />
        </Button>
        <Button size="lg" className="flex-1" onClick={() => (i + 1 < words.length ? setI(i + 1) : onDone())}>
          {i + 1 < words.length ? "Từ tiếp theo" : doneLabel} <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
