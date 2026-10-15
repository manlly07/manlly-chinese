import type { ContourPoint } from "@/lib/pitch";
import { type Tone, TONE_CLASS } from "@/lib/pinyin";
import { cn } from "@/lib/utils";

const W = 320;
const H = 150;
const X0 = 22;
const X1 = W - 8;
const x = (t: number) => X0 + t * (X1 - X0);
const y = (lvl: number) => 128 - (lvl - 1) * 26;

/** Đường cong đi qua đủ các điểm (2 điểm: thẳng; 3 điểm: cong qua điểm giữa). */
function curve(pts: ContourPoint[]): string {
  if (pts.length === 3) {
    const [a, m, b] = pts;
    const cx = 2 * x(m.x) - (x(a.x) + x(b.x)) / 2;
    const cy = 2 * y(m.y) - (y(a.y) + y(b.y)) / 2;
    return `M${x(a.x)},${y(a.y)} Q${cx},${cy} ${x(b.x)},${y(b.y)}`;
  }
  return pts.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join(" ");
}

interface Props {
  target: ContourPoint[][];
  tones: Tone[];
  labels: string[];
  user: ContourPoint[][] | null;
}

/** Biểu đồ cao độ: dải màu = thanh chuẩn, nét đậm = giọng bạn (đã căn theo trung bình mẫu). */
export function PitchChart({ target, tones, labels, user }: Props) {
  const showLabels = labels.length <= 8;
  return (
    <figure className="w-full space-y-2">
      <figcaption className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-full bg-primary/35" aria-hidden /> Thanh chuẩn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-6 rounded-full bg-foreground" aria-hidden /> Giọng bạn
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={user?.length ? "Đường cao độ giọng bạn so với thanh chuẩn" : "Đường thanh chuẩn — hãy ghi âm để so sánh"}
      >
        {[1, 2, 3, 4, 5].map((l) => (
          <g key={l}>
            <line x1={X0} x2={X1} y1={y(l)} y2={y(l)} className="stroke-border" strokeWidth="1" strokeDasharray="2 4" />
            <text x={4} y={y(l) + 4} className="fill-muted-foreground text-[10px] font-bold">
              {l}
            </text>
          </g>
        ))}
        {target.map((seg, i) => (
          <path
            key={i}
            d={curve(seg)}
            className={cn(TONE_CLASS[tones[i]], "opacity-35")}
            stroke="currentColor"
            strokeWidth={tones[i] === 5 ? 9 : 12}
            strokeLinecap="round"
            fill="none"
          />
        ))}
        {user?.map((seg, i) => (
          <path
            key={i}
            d={curve(seg)}
            className="text-foreground"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </svg>
      {showLabels && (
        <div className="flex" style={{ paddingLeft: `${(X0 / W) * 100}%`, paddingRight: `${((W - X1) / W) * 100}%` }} aria-hidden>
          {labels.map((l, i) => (
            <span key={i} className={cn("flex-1 text-center font-pinyin text-sm font-black", TONE_CLASS[tones[i]])}>
              {l}
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}
