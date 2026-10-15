import { type Tone, TONE_CLASS } from "@/lib/pinyin";
import { cn } from "@/lib/utils";

/** Đường cao độ theo thang 5 bậc (Chao). contour: [bắt đầu, (giữa), kết thúc]. */
export function ToneContour({ tone, contour, className }: { tone: Tone; contour: number[]; className?: string }) {
  const y = (lvl: number) => 50 - lvl * 9;
  const pts = contour.length === 1 ? [contour[0], contour[0]] : contour;
  const xs = pts.map((_, i) => 10 + (i * 60) / (pts.length - 1));
  const d =
    pts.length === 3
      ? `M${xs[0]},${y(pts[0])} Q${xs[1]},${y(pts[1]) + 10} ${xs[2]},${y(pts[2])}`
      : `M${xs[0]},${y(pts[0])} L${xs[1]},${y(pts[1])}`;
  return (
    <svg viewBox="0 0 80 54" className={cn("h-14 w-20", TONE_CLASS[tone], className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((l) => (
        <line key={l} x1="6" x2="74" y1={y(l)} y2={y(l)} className="stroke-border" strokeWidth="1" strokeDasharray="2 3" />
      ))}
      <path
        d={tone === 5 ? `M38,${y(3)} L42,${y(3)}` : d}
        fill="none"
        stroke="currentColor"
        strokeWidth={tone === 5 ? 8 : 5}
        strokeLinecap="round"
      />
    </svg>
  );
}
