import { Link } from "react-router-dom";
import type { HanziParts } from "@/lib/hanzi-parts";
import { cn } from "@/lib/utils";

interface Props {
  char: string;
  hp: HanziParts;
  /** gọn một dòng (trong thẻ từ) hay đầy đủ (trang chữ) */
  compact?: boolean;
  /** bộ vừa học trong bài — tô nổi */
  highlight?: Set<string>;
  className?: string;
}

/** Tách chữ thành bộ: 你 = 亻 nhân (người) + 尔 nhĩ. Chữ hình thanh ghi rõ phần gợi nghĩa / gợi âm. */
export function CharParts({ char, hp, compact, highlight, className }: Props) {
  const e = hp.chars.get(char);
  if (!e) return null;
  if (!e.parts.length)
    return compact ? null : (
      <p className={cn("text-sm font-semibold text-muted-foreground", className)}>
        <span className="hanzi text-base text-foreground">{char}</span> là chữ nguyên khối (thường là chữ tượng hình) — học cả chữ như một bộ.
      </p>
    );

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", compact ? "text-sm" : "text-base", className)} aria-label={`Cấu tạo chữ ${char}`}>
      <span className="hanzi text-lg font-bold">{char}</span>
      <span className="font-black text-muted-foreground">=</span>
      {e.parts.map((p, i) => {
        const info = hp.info.get(p);
        const role = p === e.semantic ? "gợi nghĩa" : p === e.phonetic ? "gợi âm" : null;
        const body = (
          <>
            <span className="hanzi text-lg leading-none">{p}</span>
            {info && (
              <span className="text-left leading-tight">
                {info.hanViet && <span className="block text-[11px] font-black uppercase tracking-wide">{info.hanViet}</span>}
                {!compact && <span className="block text-xs font-semibold text-muted-foreground">{info.meaning}</span>}
              </span>
            )}
            {role && !compact && <span className="rounded-full bg-background/70 px-1.5 text-[10px] font-black text-muted-foreground">{role}</span>}
          </>
        );
        const cls = cn(
          "inline-flex items-center gap-1.5 rounded-xl px-2 py-1",
          highlight?.has(p) ? "bg-candy-yellow text-candy-yellow-foreground" : role === "gợi nghĩa" ? "bg-candy-mint text-candy-mint-foreground" : "bg-muted",
        );
        return (
          <span key={`${p}-${i}`} className="inline-flex items-center gap-1.5">
            {i > 0 && <span className="font-black text-muted-foreground">+</span>}
            {hp.chars.has(p) ? (
              <Link to={`/hanzi/${encodeURIComponent(p)}`} className={cn(cls, "hover:ring-2 hover:ring-primary/40")} onClick={(ev) => ev.stopPropagation()}>
                {body}
              </Link>
            ) : (
              <span className={cls} title={info ? `${info.hanViet} — ${info.meaning}` : undefined}>
                {body}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
