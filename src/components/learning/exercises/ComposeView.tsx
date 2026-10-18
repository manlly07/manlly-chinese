import type { ComposeQuestion } from "@/lib/hanzi-parts";
import { cn } from "@/lib/utils";
import { CharParts } from "../CharParts";
import { useHanziParts } from "../use-hanzi-parts";

interface Props {
  q: ComposeQuestion;
  chosen: string | null;
  onChoose: (opt: string) => void;
}

/** Ghép chữ từ bộ: "亻 + ? = 你" → chọn thành phần còn thiếu. */
export function ComposeView({ q, chosen, onChoose }: Props) {
  const hp = useHanziParts();
  return (
    <div className="space-y-5">
      <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-border/70 bg-card p-6 text-center shadow-soft">
        <p className="text-sm font-bold text-muted-foreground">Chọn bộ còn thiếu để ghép thành chữ</p>
        <p className="flex flex-wrap items-center justify-center gap-2 text-4xl" lang="zh-CN">
          {q.parts.map((p, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="font-sans text-2xl font-black text-muted-foreground">+</span>}
              <span
                className={cn(
                  "hanzi flex size-16 items-center justify-center rounded-2xl",
                  i === q.hole ? (chosen ? "bg-candy-mint text-candy-mint-foreground" : "border-2 border-dashed border-primary/60 text-primary") : "bg-muted",
                )}
              >
                {i === q.hole && !chosen ? "?" : p}
              </span>
            </span>
          ))}
          <span className="font-sans text-2xl font-black text-muted-foreground">=</span>
          <span className="hanzi flex size-16 items-center justify-center rounded-2xl bg-candy-yellow text-candy-yellow-foreground">{q.char}</span>
        </p>
        {q.hint && <p className="text-sm font-bold text-muted-foreground">{q.hint}</p>}
        {chosen && hp && <CharParts char={q.char} hp={hp} className="justify-center" />}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((o, i) => {
          const state = !chosen ? "idle" : o === q.answer ? "right" : o === chosen ? "wrong" : "dim";
          const info = hp?.info.get(o);
          return (
            <button
              key={o}
              type="button"
              disabled={!!chosen}
              onClick={() => onChoose(o)}
              className={cn(
                "relative flex min-h-20 flex-col items-center justify-center rounded-2xl border-2 bg-card p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                state === "idle" && "border-border/70 hover:-translate-y-0.5 hover:border-primary/50",
                state === "right" && "border-candy-mint-foreground bg-candy-mint text-candy-mint-foreground",
                state === "wrong" && "border-candy-pink-foreground bg-candy-pink text-candy-pink-foreground",
                state === "dim" && "border-border/50 opacity-50",
              )}
            >
              <kbd className="absolute left-2.5 top-2 hidden font-sans text-[10px] font-black text-muted-foreground md:block">{i + 1}</kbd>
              <span className="hanzi text-3xl">{o}</span>
              {info && (
                <span className="text-xs font-bold">
                  {info.hanViet && <span className="uppercase">{info.hanViet} · </span>}
                  {info.meaning}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
