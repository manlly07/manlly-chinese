import type { StrokeData } from "@/lib/stroke-data";
import type { GridStyle, TraceStyle } from "@/lib/worksheet";

interface Props {
  /** cạnh ô, đơn vị mm (in ra đúng kích thước) */
  size: number;
  grid: GridStyle;
  char?: string;
  data?: StrokeData | null;
  /**
   * "model": chữ mẫu đậm · "trace": chữ mờ để tô · "blank": ô trống ·
   * "step": nét 0..step (nét cuối tô màu nổi) — hàng thứ tự nét
   */
  mode: "model" | "trace" | "blank" | "step";
  step?: number;
  traceStyle?: TraceStyle;
}

/** Một ô vở tập viết (SVG): khung + đường kẻ phụ 米/田 + chữ. Màu lấy từ biến --paper-* (giấy luôn trắng, kể cả chế độ tối). */
export function GridCell({ size, grid, char, data, mode, step = 0, traceStyle = "fill" }: Props) {
  const guide = { stroke: "var(--paper-guide)", strokeWidth: 6, strokeDasharray: "24 18" };
  const strokes = data?.strokes ?? [];
  // viền dày cố định 0,3 mm dù ô to hay nhỏ — tính theo tỉ lệ thì ô nhỏ chỉ còn ~0,12 mm, mảnh hơn 1 điểm ảnh nên có cạnh bị mất
  const border = (1024 * 0.3) / size;
  return (
    <svg viewBox="0 0 1024 1024" width={`${size}mm`} height={`${size}mm`} className="block shrink-0" aria-hidden>
      <rect x={border / 2} y={border / 2} width={1024 - border} height={1024 - border} fill="var(--paper-bg)" stroke="var(--paper-line)" strokeWidth={border} />
      <line x1="512" y1="4" x2="512" y2="1020" {...guide} />
      <line x1="4" y1="512" x2="1020" y2="512" {...guide} />
      {grid === "mi" && (
        <>
          <line x1="4" y1="4" x2="1020" y2="1020" {...guide} />
          <line x1="1020" y1="4" x2="4" y2="1020" {...guide} />
        </>
      )}
      {mode !== "blank" && char && strokes.length > 0 && (
        <g transform="translate(0, 900) scale(1, -1)">
          {strokes.map((d, i) => {
            if (mode === "step" && i > step) return null;
            if (mode === "trace")
              return traceStyle === "dashed" ? (
                <path key={i} d={d} fill="none" stroke="var(--paper-trace-line)" strokeWidth="9" strokeDasharray="22 16" />
              ) : (
                <path key={i} d={d} fill="var(--paper-trace)" />
              );
            const fill = mode === "step" && i === step ? "var(--paper-accent)" : "var(--paper-ink)";
            return <path key={i} d={d} fill={fill} />;
          })}
        </g>
      )}
      {/* không tải được nét (mất mạng / chữ hiếm) → dùng phông chữ */}
      {mode !== "blank" && mode !== "step" && char && !strokes.length && (
        <text
          x="512"
          y="530"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="800"
          className="hanzi"
          fill={mode === "trace" ? "var(--paper-trace)" : "var(--paper-ink)"}
        >
          {char}
        </text>
      )}
    </svg>
  );
}
