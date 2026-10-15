import { cn } from "@/lib/utils";

interface MascotProps {
  mood?: "happy" | "sleepy";
  className?: string;
}

/** Gấu trúc linh vật (SVG thuần, không tải ảnh). Màu minh hoạ cố định, không theo theme. */
export function Mascot({ mood = "happy", className }: MascotProps) {
  const ink = "#2d2438";
  return (
    <svg viewBox="0 0 120 120" className={cn("size-24", className)} aria-hidden>
      {/* lá tre */}
      <path d="M62 26 C70 8, 88 6, 94 10 C86 14, 76 22, 62 26 Z" fill="#5bc48a" />
      <path d="M62 26 C72 18, 82 13, 94 10" stroke="#3a9a66" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* tai */}
      <circle cx="28" cy="32" r="16" fill={ink} />
      <circle cx="92" cy="32" r="16" fill={ink} />
      <circle cx="28" cy="32" r="7" fill="#ff9fb8" opacity="0.55" />
      <circle cx="92" cy="32" r="7" fill="#ff9fb8" opacity="0.55" />
      {/* mặt */}
      <ellipse cx="60" cy="66" rx="45" ry="41" fill="#fff" stroke={ink} strokeWidth="3" />
      {/* quầng mắt */}
      <ellipse cx="41" cy="62" rx="11" ry="14" transform="rotate(-28 41 62)" fill={ink} />
      <ellipse cx="79" cy="62" rx="11" ry="14" transform="rotate(28 79 62)" fill={ink} />
      {mood === "happy" ? (
        <>
          <circle cx="43" cy="61" r="5.5" fill="#fff" />
          <circle cx="77" cy="61" r="5.5" fill="#fff" />
          <circle cx="44" cy="62" r="3.2" fill={ink} />
          <circle cx="76" cy="62" r="3.2" fill={ink} />
          <circle cx="45.3" cy="60.4" r="1.2" fill="#fff" />
          <circle cx="77.3" cy="60.4" r="1.2" fill="#fff" />
        </>
      ) : (
        <>
          <path d="M37 63 Q43 67 49 63" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M71 63 Q77 67 83 63" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* má hồng */}
      <ellipse cx="28" cy="80" rx="7.5" ry="4.5" fill="#ff9fb8" opacity="0.85" />
      <ellipse cx="92" cy="80" rx="7.5" ry="4.5" fill="#ff9fb8" opacity="0.85" />
      {/* mũi + miệng */}
      <ellipse cx="60" cy="76" rx="5.5" ry="3.8" fill={ink} />
      {mood === "happy" ? (
        <path d="M52 82 Q56 88 60 82 Q64 88 68 82" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <ellipse cx="60" cy="85" rx="3" ry="2.2" fill={ink} />
      )}
    </svg>
  );
}
