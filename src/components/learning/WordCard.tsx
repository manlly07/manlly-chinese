import { Link } from "react-router-dom";
import type { Word } from "@/lib/content";
import { cardStatus } from "@/lib/srs";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { useSettings } from "@/store/settings";
import { FavoriteButton } from "./FavoriteButton";
import { HanziText } from "./HanziText";
import { PinyinText } from "./PinyinText";
import { SpeakButton } from "./SpeakButton";

const STATUS = {
  new: null,
  learning: { label: "Đang học", cls: "bg-candy-sky text-candy-sky-foreground" },
  mature: { label: "Đã thuộc", cls: "bg-candy-mint text-candy-mint-foreground" },
} as const;

/** Một dòng từ vựng trong danh sách — bấm để xem chi tiết. */
export function WordCard({ word, className }: { word: Word; className?: string }) {
  const showPinyin = useSettings((s) => s.showPinyin);
  const showHanViet = useSettings((s) => s.showHanViet);
  const status = STATUS[cardStatus(useProgress((s) => s.cards[word.id]))];

  return (
    <Link
      to={`/vocab/${encodeURIComponent(word.id)}`}
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-lg border border-border/70 bg-card p-3 pr-2 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="flex min-w-14 max-w-[40%] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted px-2 py-1.5 transition-colors group-hover:bg-accent">
        <HanziText variant="list">{word.hanzi}</HanziText>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2">
          {showPinyin && <PinyinText pinyin={word.pinyin} className="font-bold" />}
          {status && <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black", status.cls)}>{status.label}</span>}
        </span>
        <span className="block truncate font-semibold">{word.meaning.join(", ")}</span>
        {showHanViet && word.hanViet && <span className="block truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">{word.hanViet}</span>}
      </span>
      <span className="-mr-1 flex shrink-0 items-center">
        <SpeakButton text={word.hanzi} className="size-9" />
        <FavoriteButton id={word.id} className="size-9" />
      </span>
    </Link>
  );
}
