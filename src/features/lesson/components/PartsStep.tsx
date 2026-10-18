import { ChevronRight } from "lucide-react";
import { CharParts } from "@/components/learning/CharParts";
import { Button } from "@/components/ui/button";
import type { HanziParts } from "@/lib/hanzi-parts";

interface Props {
  parts: string[];
  /** chữ của bài này */
  chars: string[];
  hp: HanziParts;
  onDone: () => void;
}

/** Bước "Bộ mới": học từng bộ riêng lẻ trước, rồi xem chúng ghép thành chữ của bài. */
export function PartsStep({ parts, chars, hp, onDone }: Props) {
  const fresh = new Set(parts);
  const built = chars.filter((c) => hp.chars.get(c)?.parts.some((p) => fresh.has(p)));
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="rounded-2xl bg-candy-yellow p-4 font-semibold text-candy-yellow-foreground">
        Chữ Hán được ghép từ các bộ. Nhớ bộ trước thì chữ mới chỉ là “ghép lại” — và bạn đoán được nghĩa, đôi khi cả cách đọc.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {parts.map((p) => {
          const info = hp.info.get(p);
          const examples = chars.filter((c) => hp.chars.get(c)?.parts.includes(p));
          return (
            <div key={p} className="flex gap-4 rounded-2xl border-2 border-border/70 bg-card p-4">
              <span className="hanzi flex size-20 shrink-0 items-center justify-center rounded-2xl bg-candy-mint text-5xl text-candy-mint-foreground">{p}</span>
              <div className="min-w-0 space-y-1">
                {info?.hanViet && <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{info.hanViet}</p>}
                <p className="text-lg font-black">{info?.meaning}</p>
                {info?.note && <p className="text-xs font-semibold text-muted-foreground">{info.note}</p>}
                {examples.length > 0 && (
                  <p className="text-sm font-bold">
                    Trong bài: <span className="hanzi text-base">{examples.join(" ")}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {built.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <p className="font-black">Ghép lại thành chữ</p>
          {built.map((c) => (
            <CharParts key={c} char={c} hp={hp} highlight={fresh} />
          ))}
        </div>
      )}
      <Button size="lg" className="w-full" onClick={onDone}>
        Sang từ mới <ChevronRight />
      </Button>
    </div>
  );
}
