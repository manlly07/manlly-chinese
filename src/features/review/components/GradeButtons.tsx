import { formatInterval } from "@/lib/date";
import { GRADE_LABELS, type Grade, previewInterval, type CardState } from "@/lib/srs";
import { cn } from "@/lib/utils";

const STYLE: Record<Grade, string> = {
  0: "bg-candy-pink text-candy-pink-foreground [--btn-shadow:var(--candy-pink-foreground)]",
  1: "bg-candy-yellow text-candy-yellow-foreground [--btn-shadow:var(--candy-yellow-foreground)]",
  2: "bg-candy-sky text-candy-sky-foreground [--btn-shadow:var(--candy-sky-foreground)]",
  3: "bg-candy-mint text-candy-mint-foreground [--btn-shadow:var(--candy-mint-foreground)]",
};

export function GradeButtons({ card, onGrade }: { card: CardState | undefined; onGrade: (g: Grade) => void }) {
  const now = Date.now();
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3">
      {([0, 1, 2, 3] as Grade[]).map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onGrade(g)}
          className={cn(
            "btn-pop flex min-h-16 flex-col items-center justify-center rounded-2xl px-1 py-2 font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            STYLE[g],
          )}
        >
          <span>{GRADE_LABELS[g]}</span>
          <span className="text-xs font-bold opacity-80">{formatInterval(previewInterval(card, g, now))}</span>
          <kbd className="mt-0.5 hidden text-[10px] font-bold opacity-60 md:block">{g + 1}</kbd>
        </button>
      ))}
    </div>
  );
}
