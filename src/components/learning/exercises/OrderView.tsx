import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { OrderExercise } from "@/lib/content";
import { normalizeZh } from "@/lib/exercises";
import { shuffle } from "@/lib/random";
import { cn } from "@/lib/utils";

interface Props {
  ex: OrderExercise;
  done: boolean;
  onAnswer: (correct: boolean, given: string) => void;
}

/** Sắp xếp câu: chạm từ để ghép, chạm lại để bỏ. */
export function OrderView({ ex, done, onAnswer }: Props) {
  const pool = useMemo(() => {
    let s = shuffle(ex.tokens.map((t, i) => ({ t, i })));
    // tránh trường hợp xáo ra đúng thứ tự đáp án
    for (let k = 0; k < 5 && normalizeZh(s.map((x) => x.t).join("")) === normalizeZh(ex.answer); k++) s = shuffle(s);
    return s;
  }, [ex]);
  const [picked, setPicked] = useState<number[]>([]);
  const given = picked.map((i) => ex.tokens[i]).join("");
  const correct = normalizeZh(given) === normalizeZh(ex.answer);

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 text-center shadow-soft">
        <p className="text-sm font-bold text-muted-foreground">Sắp xếp thành câu đúng</p>
        {ex.vi && <p className="mt-1 text-lg font-black">“{ex.vi}”</p>}
        <div
          className={cn(
            "mt-4 flex min-h-16 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3",
            done ? (correct ? "border-candy-mint-foreground bg-candy-mint" : "border-candy-pink-foreground bg-candy-pink") : "border-border",
          )}
          aria-live="polite"
        >
          {picked.length === 0 && <span className="text-sm font-semibold text-muted-foreground">Chạm vào các từ bên dưới</span>}
          {picked.map((i, k) => (
            <button
              key={`${i}-${k}`}
              type="button"
              disabled={done}
              onClick={() => setPicked((p) => p.filter((_, j) => j !== k))}
              className="hanzi rounded-xl bg-card px-3 py-1.5 text-2xl shadow-soft"
            >
              {ex.tokens[i]}
            </button>
          ))}
        </div>
        {done && !correct && (
          <p className="mt-3 font-bold">
            Đáp án: <span className="hanzi text-xl">{ex.answer}</span>
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {pool.map(({ t, i }) => {
          const used = picked.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={used || done}
              onClick={() => setPicked((p) => [...p, i])}
              className={cn(
                "btn-pop hanzi min-h-12 rounded-2xl border-2 border-border bg-card px-4 text-2xl [--btn-shadow:var(--outline-shadow)]",
                used && "invisible",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
      {!done && (
        <Button className="w-full" size="lg" disabled={picked.length !== ex.tokens.length} onClick={() => onAnswer(correct, given)}>
          Kiểm tra
        </Button>
      )}
    </div>
  );
}
