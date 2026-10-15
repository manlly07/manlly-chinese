import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Bar {
  key: string;
  label: string;
  value: number;
  /** dòng chú thích trong tooltip */
  detail?: string;
}

interface BarChartProps {
  bars: Bar[];
  /** tên chuỗi số liệu (đọc cho trình đọc màn hình + tiêu đề bảng) */
  name: string;
  unit?: string;
  /** nhãn trục x hiển thị ở các vị trí này (mặc định: đầu, giữa, cuối) */
  tickEvery?: number;
  height?: number;
  className?: string;
}

/** Biểu đồ cột đơn chuỗi: cột mảnh, bo 4px đầu cột, khe 2px, lưới mờ, tooltip khi rê/chạm/focus, có bảng dữ liệu. */
export function BarChart({ bars, name, unit = "", tickEvery, height = 160, className }: BarChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...bars.map((b) => b.value));
  // trục y luôn có vạch giữa là số nguyên
  const niceMax = max <= 4 ? Math.max(2, Math.ceil(max / 2) * 2) : Math.ceil(max / 10) * 10;
  const step = tickEvery ?? Math.max(1, Math.ceil(bars.length / 6));
  const cur = active !== null ? bars[active] : null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative" style={{ height }}>
        {/* lưới + nhãn trục y */}
        {[1, 0.5, 0].map((f) => (
          <div key={f} className="absolute inset-x-0 flex items-center gap-2" style={{ top: `${(1 - f) * 100}%` }}>
            <span className="w-7 -translate-y-1/2 text-right text-[10px] font-bold tabular-nums text-muted-foreground">{Math.round(niceMax * f)}</span>
            <span className={cn("h-px flex-1 -translate-y-1/2", f === 0 ? "bg-border" : "bg-border/50")} />
          </div>
        ))}
        <div className="absolute inset-y-0 left-9 right-0 flex items-end gap-[2px]" role="img" aria-label={`Biểu đồ ${name}`}>
          {bars.map((b, i) => (
            <button
              key={b.key}
              type="button"
              className="group relative flex h-full flex-1 items-end focus-visible:outline-none"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(i)}
              aria-label={`${b.label}: ${b.value}${unit}`}
            >
              <span
                className={cn(
                  "block w-full rounded-t-[4px] bg-chart-series transition-opacity",
                  active !== null && active !== i && "opacity-40",
                  "group-focus-visible:ring-2 group-focus-visible:ring-ring",
                )}
                style={{ height: b.value ? `max(3px, ${(b.value / niceMax) * 100}%)` : 0 }}
              />
            </button>
          ))}
        </div>
        {cur && active !== null && (
          <div
            className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl border bg-popover px-3 py-1.5 text-xs shadow-soft"
            style={{ left: `calc(2.25rem + (100% - 2.25rem) * ${(active + 0.5) / bars.length})` }}
          >
            <p className="font-bold text-muted-foreground">{cur.label}</p>
            <p className="font-black text-foreground">
              {cur.value}
              {unit} {name}
            </p>
            {cur.detail && <p className="font-semibold text-muted-foreground">{cur.detail}</p>}
          </div>
        )}
      </div>
      <div className="ml-9 flex gap-[2px] text-[10px] font-bold text-muted-foreground">
        {bars.map((b, i) => (
          <span key={b.key} className="flex-1 text-center">
            {i % step === 0 || i === bars.length - 1 ? b.label : ""}
          </span>
        ))}
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer font-bold text-muted-foreground">Xem dạng bảng</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-muted-foreground">
              <th className="py-1 font-bold">Ngày</th>
              <th className="py-1 text-right font-bold">{name}</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((b) => (
              <tr key={b.key} className="border-t border-border/60">
                <td className="py-1 font-semibold">{b.label}</td>
                <td className="py-1 text-right font-bold tabular-nums">
                  {b.value}
                  {unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
