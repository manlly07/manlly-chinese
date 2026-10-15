import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type HanziWriterType from "hanzi-writer";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { HanziGrid } from "./HanziGrid";

export interface HanziWriterHandle {
  animate: () => void;
  quiz: (opts?: { showOutline?: boolean }) => void;
  reset: () => void;
}

interface HanziWriterBoxProps {
  char: string;
  size?: number;
  /** tự chạy hoạt ảnh khi tải xong */
  autoAnimate?: boolean;
  onQuizComplete?: (mistakes: number) => void;
  onMistake?: () => void;
  onCorrectStroke?: () => void;
  onLoad?: (strokes: number) => void;
  className?: string;
}

/** Token "H S% L%" → "#rrggbb" (hanzi-writer chỉ nhận hex/rgb). */
const cssColor = (name: string) => {
  const [h, sat, l] = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
    .split(/\s+/)
    .map((x) => parseFloat(x));
  if ([h, sat, l].some(Number.isNaN)) return "#333333";
  const s = sat / 100;
  const L = l / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = L - s * Math.min(L, 1 - L) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

/** Ô chữ Hán: hoạt ảnh thứ tự nét + chế độ tập viết có chấm lỗi. Dữ liệu nét tải từ jsDelivr khi cần. */
export const HanziWriterBox = forwardRef<HanziWriterHandle, HanziWriterBoxProps>(function HanziWriterBox(
  { char, size = 240, autoAnimate = false, onQuizComplete, onMistake, onCorrectStroke, onLoad, className },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const writer = useRef<HanziWriterType | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const cbs = useRef({ onQuizComplete, onMistake, onCorrectStroke, onLoad });
  cbs.current = { onQuizComplete, onMistake, onCorrectStroke, onLoad };

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    const el = host.current;
    if (!el) return;
    el.innerHTML = "";
    import("hanzi-writer").then(({ default: HanziWriter }) => {
      if (!alive) return;
      writer.current = HanziWriter.create(el, char, {
        width: size,
        height: size,
        padding: Math.round(size * 0.06),
        strokeColor: cssColor("--foreground"),
        radicalColor: cssColor("--primary"),
        outlineColor: cssColor("--border"),
        highlightColor: cssColor("--candy-sky-foreground"),
        drawingColor: cssColor("--primary"),
        drawingWidth: Math.max(8, size / 20),
        strokeAnimationSpeed: 1.2,
        delayBetweenStrokes: 250,
        showHintAfterMisses: 2,
        onLoadCharDataSuccess: (data) => {
          if (!alive) return;
          setStatus("ready");
          cbs.current.onLoad?.(data.strokes.length);
          if (autoAnimate) writer.current?.animateCharacter();
        },
        onLoadCharDataError: () => alive && setStatus("error"),
      });
    });
    return () => {
      alive = false;
      writer.current?.cancelQuiz();
      writer.current = null;
      el.innerHTML = "";
    };
  }, [char, size, autoAnimate]);

  useImperativeHandle(ref, () => ({
    animate: () => {
      const w = writer.current;
      if (!w) return;
      w.cancelQuiz();
      w.showCharacter();
      w.animateCharacter();
    },
    quiz: ({ showOutline = true } = {}) => {
      const w = writer.current;
      if (!w) return;
      if (showOutline) w.showOutline();
      else w.hideOutline();
      w.quiz({
        onMistake: () => cbs.current.onMistake?.(),
        onCorrectStroke: () => cbs.current.onCorrectStroke?.(),
        onComplete: (s) => cbs.current.onQuizComplete?.(s.totalMistakes),
      });
    },
    reset: () => {
      const w = writer.current;
      if (!w) return;
      w.cancelQuiz();
      w.showOutline();
      w.showCharacter();
    },
  }));

  return (
    <div className={cn("relative mx-auto rounded-2xl bg-card", className)} style={{ width: size, height: size }}>
      <HanziGrid />
      <div ref={host} className="relative touch-none" />
      {status === "loading" && (
        <div className="hanzi absolute inset-0 flex animate-pulse items-center justify-center text-muted-foreground/40" style={{ fontSize: size * 0.7 }}>
          {char}
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-sm font-semibold text-muted-foreground">
          <span className="hanzi text-foreground" style={{ fontSize: size * 0.45 }}>
            {char}
          </span>
          <span className="flex items-center gap-1">
            <WifiOff className="size-4" aria-hidden /> Chưa tải được thứ tự nét (cần mạng)
          </span>
        </div>
      )}
    </div>
  );
});
