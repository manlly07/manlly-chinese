import { useState } from "react";
import { HanziText } from "@/components/learning/HanziText";
import { PinyinText } from "@/components/learning/PinyinText";
import { useSpeech } from "@/components/learning/use-speech";
import { Card, CardContent } from "@/components/ui/card";
import type { PinyinData, PinyinSound } from "@/lib/content";
import { cn } from "@/lib/utils";

function SoundGrid({ items, selected, onPick }: { items: PinyinSound[]; selected?: string; onPick: (s: PinyinSound) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
      {items.map((s) => (
        <button
          key={s.py}
          type="button"
          onClick={() => onPick(s)}
          aria-pressed={selected === s.py}
          className={cn(
            "flex min-h-16 flex-col items-center justify-center rounded-2xl border-2 bg-card p-2 font-black transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selected === s.py ? "border-primary bg-candy-pink text-candy-pink-foreground" : "border-border/70",
          )}
        >
          <span className="font-pinyin text-xl">{s.py}</span>
          <span className="hanzi text-sm font-medium text-muted-foreground">{s.example.hanzi}</span>
        </button>
      ))}
    </div>
  );
}

export function ChartTab({ data }: { data: PinyinData }) {
  const { say } = useSpeech();
  const [sel, setSel] = useState<PinyinSound>(data.initials[0]);
  const pick = (s: PinyinSound) => {
    setSel(s);
    void say(s.example.hanzi);
  };
  const groups = [...new Set(data.finals.map((f) => f.group ?? ""))];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="font-black">Thanh mẫu (phụ âm đầu) · {data.initials.length}</h2>
          <SoundGrid items={data.initials} selected={sel.py} onPick={pick} />
        </section>
        {groups.map((g) => (
          <section key={g} className="space-y-3">
            <h2 className="font-black">Vận mẫu {g}</h2>
            <SoundGrid items={data.finals.filter((f) => f.group === g)} selected={sel.py} onPick={pick} />
          </section>
        ))}
      </div>

      <Card className="h-fit lg:sticky lg:top-20">
        <CardContent className="space-y-3 p-5 text-center">
          <p className="font-pinyin text-5xl font-black text-primary">{sel.py}</p>
          <button
            type="button"
            onClick={() => void say(sel.example.hanzi)}
            className="mx-auto flex flex-col items-center rounded-2xl bg-candy-yellow px-6 py-3 text-candy-yellow-foreground"
          >
            <HanziText variant="list">{sel.example.hanzi}</HanziText>
            <PinyinText pinyin={sel.example.pinyin} className="font-bold" />
          </button>
          <p className="text-left font-semibold">{sel.tip}</p>
          <p className="text-xs font-semibold text-muted-foreground">Chạm vào một ô để nghe ví dụ.</p>
        </CardContent>
      </Card>
    </div>
  );
}
