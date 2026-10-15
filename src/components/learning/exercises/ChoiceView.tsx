import type { ChooseExercise, FillExercise } from "@/lib/content";
import { cn } from "@/lib/utils";

interface Props {
  ex: FillExercise | ChooseExercise;
  chosen: string | null;
  onChoose: (opt: string) => void;
}

/** Điền chỗ trống (fill) hoặc chọn câu đúng (choose). */
export function ChoiceView({ ex, chosen, onChoose }: Props) {
  const isFill = ex.type === "fill";
  const parts = isFill ? ex.text.split("＿") : [];
  return (
    <div className="space-y-5">
      <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-[1.75rem] border border-border/70 bg-card p-6 text-center shadow-soft">
        {isFill ? (
          <p className="text-sm font-bold text-muted-foreground">Chọn từ điền vào chỗ trống</p>
        ) : (
          <>
            <p className="text-sm font-bold text-muted-foreground">Chọn đáp án đúng</p>
            <p className="text-xl font-black md:text-2xl">{ex.prompt}</p>
          </>
        )}
        {isFill && (
          <p lang="zh-CN" className="hanzi text-3xl leading-relaxed">
            {parts[0]}
            <span
              className={cn(
                "mx-1 inline-block min-w-12 rounded-lg border-b-4 px-2 text-center",
                chosen ? (chosen === ex.answer ? "border-candy-mint-foreground text-candy-mint-foreground" : "border-candy-pink-foreground text-candy-pink-foreground") : "border-primary/50",
              )}
            >
              {chosen ?? " "}
            </span>
            {parts[1]}
          </p>
        )}
        {isFill && ex.vi && <p className="font-semibold text-muted-foreground">{ex.vi}</p>}
      </div>
      <div className={cn("grid gap-3", isFill ? "grid-cols-3" : "grid-cols-1")}>
        {ex.options.map((o, i) => {
          const state = !chosen ? "idle" : o === ex.answer ? "right" : o === chosen ? "wrong" : "dim";
          return (
            <button
              key={o}
              type="button"
              disabled={!!chosen}
              onClick={() => onChoose(o)}
              className={cn(
                "hanzi relative flex min-h-16 items-center justify-center rounded-2xl border-2 bg-card p-3 text-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !isFill && "text-xl",
                state === "idle" && "border-border/70 hover:-translate-y-0.5 hover:border-primary/50",
                state === "right" && "border-candy-mint-foreground bg-candy-mint text-candy-mint-foreground",
                state === "wrong" && "border-candy-pink-foreground bg-candy-pink text-candy-pink-foreground",
                state === "dim" && "border-border/50 opacity-50",
              )}
            >
              <kbd className="absolute left-2.5 top-2 hidden font-sans text-[10px] font-black text-muted-foreground md:block">{i + 1}</kbd>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
