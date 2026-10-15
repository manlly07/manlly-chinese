import { Link } from "react-router-dom";
import { HanziWriterBox } from "@/components/learning/HanziWriterBox";
import { hanChars, hanVietPerChar, type Word } from "@/lib/content";

/** Các chữ thành phần của từ, có hoạt ảnh nét — bấm để sang trang chữ. */
export function CharBreakdown({ word }: { word: Word }) {
  const chars = hanChars(word.hanzi);
  const hv = hanVietPerChar(word);
  const syl = word.pinyin.split(/\s+/);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {chars.map((c, i) => (
        <Link
          key={`${c}-${i}`}
          to={`/hanzi/${encodeURIComponent(c)}`}
          className="flex flex-col items-center gap-2 rounded-lg border border-border/70 bg-card p-3 shadow-soft transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HanziWriterBox char={c} size={120} autoAnimate />
          <span className="text-center text-sm font-bold">
            {syl.length === chars.length && <span className="block">{syl[i]}</span>}
            {hv[i] && <span className="block text-xs uppercase tracking-wide text-muted-foreground">{hv[i]}</span>}
          </span>
        </Link>
      ))}
    </div>
  );
}
