// Bộ icon minh hoạ dễ thương (SVG thuần, cùng phong cách với Mascot):
// viền mực tím than, khối bo tròn màu kẹo, khuôn mặt nhỏ (mắt chấm, miệng cười, má hồng).
// Màu minh hoạ cố định — mỗi icon có nền sáng riêng nên đọc được ở cả chế độ sáng/tối.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mực vẽ mắt/miệng (luôn đậm, nằm trên khối màu sáng). */
const INK = "#2d2438";
/** Mực viền — theo theme: tím than ở chế độ sáng, tím nhạt ở chế độ tối để nét đứng riêng không chìm vào nền. */
const OUT = "var(--cute-ink, #2d2438)";
const BLUSH = "#ff9fb8";
const C = {
  pink: "#ffc2d1",
  rose: "#ff7a9a",
  peach: "#ffd6b0",
  orange: "#ffb35c",
  yellow: "#ffe08a",
  gold: "#ffcd4d",
  mint: "#b8edcf",
  green: "#5bc48a",
  sky: "#bfe3ff",
  blue: "#7cc0f5",
  lilac: "#d9c8ff",
  purple: "#a98af0",
  white: "#fffaf5",
};
const line = { stroke: OUT, strokeWidth: 2.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Khuôn mặt kawaii đặt tại (x, y); `s` = tỉ lệ. */
function Face({ x, y, s = 1, blush = true, mood = "happy" }: { x: number; y: number; s?: number; blush?: boolean; mood?: "happy" | "wink" | "calm" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {mood === "wink" ? (
        <path d="M-5.5 -0.5 Q-4 -2 -2.5 -0.5" fill="none" {...line} stroke={INK} strokeWidth={1.8} />
      ) : (
        <circle cx={-4} cy={0} r={1.6} fill={INK} />
      )}
      {mood === "calm" ? (
        <path d="M2.5 -0.5 Q4 -2 5.5 -0.5" fill="none" {...line} stroke={INK} strokeWidth={1.8} />
      ) : (
        <circle cx={4} cy={0} r={1.6} fill={INK} />
      )}
      {mood === "calm" && <path d="M-5.5 -0.5 Q-4 -2 -2.5 -0.5" fill="none" {...line} stroke={INK} strokeWidth={1.8} />}
      <path d="M-2.2 2.6 Q0 4.8 2.2 2.6" fill="none" {...line} stroke={INK} strokeWidth={1.8} />
      {blush && (
        <>
          <ellipse cx={-7.2} cy={2.8} rx={2} ry={1.2} fill={BLUSH} opacity={0.9} />
          <ellipse cx={7.2} cy={2.8} rx={2} ry={1.2} fill={BLUSH} opacity={0.9} />
        </>
      )}
    </g>
  );
}

const Sparkle = ({ x, y, r = 3, fill = C.gold }: { x: number; y: number; r?: number; fill?: string }) => (
  <path d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`} fill={fill} stroke={OUT} strokeWidth={1.2} strokeLinejoin="round" />
);

const ICONS = {
  home: (
    <>
      <rect x="35" y="9" width="5" height="9" rx="1.5" fill={C.orange} {...line} />
      <rect x="10" y="21" width="28" height="19" rx="5" fill={C.pink} {...line} />
      <path d="M5.5 24 L24 8.5 L42.5 24" fill={C.rose} {...line} />
      <path d="M8 22.5 L24 9.5 L40 22.5 Z" fill={C.rose} />
      <Face x={24} y={29} />
    </>
  ),
  path: (
    <>
      <path d="M6 12 L17 8 L31 12 L42 8 V36 L31 40 L17 36 L6 40 Z" fill={C.mint} {...line} />
      <path d="M17 8 V36 M31 12 V40" fill="none" {...line} strokeWidth={1.6} opacity={0.5} />
      <path d="M11 33 Q16 24 24 27 T37 17" fill="none" stroke={C.rose} strokeWidth={2.4} strokeDasharray="0.1 4.2" strokeLinecap="round" />
      <path d="M37 18 V6" {...line} />
      <path d="M37 6 L45 9 L37 12 Z" fill={C.rose} {...line} strokeWidth={1.8} />
      <Face x={20} y={18} s={0.85} />
    </>
  ),
  review: (
    <>
      <rect x="14" y="6" width="24" height="30" rx="5" fill={C.lilac} {...line} transform="rotate(12 26 21)" />
      <rect x="9" y="11" width="24" height="30" rx="5" fill={C.yellow} {...line} />
      <Face x={21} y={24} />
      <path d="M38 31 A7 7 0 1 1 33 25" fill="none" {...line} stroke={C.blue} strokeWidth={3} />
      <path d="M31 22 L34 25.5 L30 27" fill="none" {...line} stroke={C.blue} strokeWidth={3} />
    </>
  ),
  vocab: (
    <>
      <rect x="10" y="7" width="27" height="34" rx="5" fill={C.white} {...line} />
      <rect x="10" y="7" width="24" height="34" rx="5" fill={C.rose} {...line} />
      <path d="M15 7 V41" {...line} strokeWidth={1.6} opacity={0.4} />
      <path d="M27 7 V17 L30 14.5 L33 17 V7" fill={C.gold} {...line} strokeWidth={1.8} />
      <Face x={23} y={27} />
    </>
  ),
  pronunciation: (
    <>
      <path d="M24 33 V40 M17 40 H31" fill="none" {...line} />
      <path d="M13 22 Q13 33 24 33 Q35 33 35 22" fill="none" {...line} />
      <rect x="16" y="5" width="16" height="24" rx="8" fill={C.sky} {...line} />
      <Face x={24} y={18} s={0.85} />
      <path d="M39 12 Q42 16 39 20 M42.5 9 Q47 16 42.5 23" fill="none" {...line} stroke={C.rose} strokeWidth={2.2} />
    </>
  ),
  hanzi: (
    <>
      <rect x="6" y="9" width="30" height="31" rx="5" fill={C.white} {...line} />
      <path d="M11 24.5 H31 M21 14 V35" stroke={C.rose} strokeWidth={1.4} strokeDasharray="2 2.5" opacity={0.8} />
      <path d="M12.5 21 Q21 18 29.5 21.5" fill="none" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M44 6 L30 26" {...line} strokeWidth={7} />
      <path d="M44 6 L30 26" stroke={C.orange} strokeWidth={4} strokeLinecap="round" />
      <path d="M31.5 24 Q27 27 27.5 32 Q32 31 33.5 27 Z" fill={INK} />
      <Face x={18} y={31} s={0.75} />
    </>
  ),
  grammar: (
    <>
      <path
        d="M9 15 H18 Q18 9 23 9 Q28 9 28 15 H37 V24 Q43 24 43 29 Q43 34 37 34 V41 H9 V32 Q14 32 14 28 Q14 24 9 24 Z"
        fill={C.mint}
        {...line}
      />
      <Face x={25} y={28} />
    </>
  ),
  listening: (
    <>
      <circle cx="24" cy="27" r="12" fill={C.yellow} {...line} />
      <Face x={24} y={28} s={0.9} />
      <path d="M9 27 V22 Q9 7 24 7 Q39 7 39 22 V27" fill="none" {...line} strokeWidth={3} />
      <rect x="5" y="21" width="8" height="13" rx="4" fill={C.rose} {...line} />
      <rect x="35" y="21" width="8" height="13" rx="4" fill={C.rose} {...line} />
      <path d="M41 6 V13 M41 6 L45 5 V11" fill="none" {...line} strokeWidth={1.8} />
      <circle cx="39.8" cy="13.5" r="1.8" fill={OUT} />
    </>
  ),
  reading: (
    <>
      <rect x="11" y="9" width="26" height="30" rx="3" fill={C.yellow} {...line} />
      <rect x="7" y="6" width="34" height="7" rx="3.5" fill={C.orange} {...line} />
      <rect x="7" y="35" width="34" height="7" rx="3.5" fill={C.orange} {...line} />
      <path d="M16 18 H32" {...line} strokeWidth={1.8} opacity={0.5} />
      <Face x={24} y={26} />
    </>
  ),
  practice: (
    <>
      <path d="M15 10 H33 V19 Q33 30 24 30 Q15 30 15 19 Z" fill={C.gold} {...line} />
      <path d="M15 13 H9 Q9 22 16 23 M33 13 H39 Q39 22 32 23" fill="none" {...line} />
      <path d="M24 30 V35" {...line} />
      <rect x="15" y="35" width="18" height="6" rx="2.5" fill={C.orange} {...line} />
      <Face x={24} y={19} s={0.9} />
      <Sparkle x={42} y={6} r={3.2} />
    </>
  ),
  dictionary: (
    <>
      <path d="M31 31 L41 41" {...line} strokeWidth={7} />
      <path d="M31 31 L41 41" stroke={C.rose} strokeWidth={4} strokeLinecap="round" />
      <circle cx="21" cy="21" r="13" fill={C.sky} {...line} />
      <path d="M13 17 Q15 12 20 11" fill="none" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" />
      <Face x={21} y={22} />
    </>
  ),
  stats: (
    <>
      <path d="M6 41 H42" {...line} />
      <rect x="9" y="27" width="8" height="14" rx="3" fill={C.mint} {...line} />
      <rect x="20" y="10" width="10" height="31" rx="3.5" fill={C.rose} {...line} />
      <rect x="33" y="20" width="8" height="21" rx="3" fill={C.yellow} {...line} />
      <Face x={25} y={20} s={0.6} blush={false} />
      <Sparkle x={9} y={12} r={3} />
    </>
  ),
  settings: (
    <>
      <path
        d="M21 5 H27 L28 10 L32.5 12 L37 9 L41 13 L38 17.5 L40 22 L45 23 V29 L40 30 L38 34.5 L41 39 L37 43 L32.5 40 L28 42 L27 47 H21 L20 42 L15.5 40 L11 43 L7 39 L10 34.5 L8 30 L3 29 V23 L8 22 L10 17.5 L7 13 L11 9 L15.5 12 L20 10 Z"
        transform="translate(24 26) scale(0.86) translate(-24 -26)"
        fill={C.lilac}
        {...line}
      />
      <circle cx="24" cy="26" r="9" fill={C.white} {...line} />
      <Face x={24} y={25.5} s={0.7} blush={false} />
    </>
  ),
  flame: (
    <>
      <path d="M24 5 Q29 13 34 16 Q41 21 39 30 Q37 42 24 42 Q11 42 9.5 31 Q8.5 22 15 17 Q16 23 19 23 Q17 13 24 5 Z" fill={C.orange} {...line} />
      <path d="M24 22 Q30 27 30 33 Q30 39 24 39 Q18 39 18 33 Q18 28 24 22 Z" fill={C.gold} />
      <Face x={24} y={32} s={0.8} />
    </>
  ),
  star: (
    <>
      <path
        d="M24 5 L29.4 16.3 L41.8 17.8 L32.7 26.3 L35 38.6 L24 32.6 L13 38.6 L15.3 26.3 L6.2 17.8 L18.6 16.3 Z"
        fill={C.gold}
        {...line}
      />
      <Face x={24} y={24} s={0.85} />
    </>
  ),
  medal: (
    <>
      <path d="M15 5 L21 20 M33 5 L27 20" {...line} strokeWidth={7} />
      <path d="M15 5 L21 20" stroke={C.blue} strokeWidth={4} strokeLinecap="round" />
      <path d="M33 5 L27 20" stroke={C.rose} strokeWidth={4} strokeLinecap="round" />
      <circle cx="24" cy="30" r="12" fill={C.gold} {...line} />
      <circle cx="24" cy="30" r="8.5" fill="none" stroke={C.orange} strokeWidth={1.8} />
      <Face x={24} y={30} s={0.75} />
    </>
  ),
  shield: (
    <>
      <path d="M24 5 L40 11 V22 Q40 36 24 43 Q8 36 8 22 V11 Z" fill={C.sky} {...line} />
      <path d="M24 9 L36 13.5 V22 Q36 33 24 39 Z" fill={C.blue} opacity={0.35} />
      <Face x={24} y={23} />
      <path d="M17 31 L21 34.5 L31 27" fill="none" {...line} stroke={C.green} strokeWidth={3} />
    </>
  ),
  bandage: (
    <>
      <rect x="4" y="16" width="40" height="16" rx="8" fill={C.peach} {...line} transform="rotate(-25 24 24)" />
      <rect x="16" y="17" width="16" height="14" rx="3" fill={C.white} {...line} strokeWidth={1.8} transform="rotate(-25 24 24)" />
      <Face x={24} y={23.5} s={0.75} />
      <circle cx="9" cy="31" r="1" fill={OUT} opacity={0.5} />
      <circle cx="39" cy="17" r="1" fill={OUT} opacity={0.5} />
    </>
  ),
  gift: (
    <>
      <rect x="8" y="19" width="32" height="22" rx="4" fill={C.rose} {...line} />
      <rect x="6" y="13" width="36" height="8" rx="3" fill={C.pink} {...line} />
      <path d="M24 13 V41" stroke={C.gold} strokeWidth={5} />
      <path d="M24 13 V41" fill="none" {...line} strokeWidth={1.4} opacity={0.4} />
      <path d="M24 13 Q16 4 13 9 Q12 13 24 13 Q36 13 35 9 Q32 4 24 13 Z" fill={C.gold} {...line} strokeWidth={2} />
      <Face x={16} y={30} s={0.7} />
    </>
  ),
  sparkle: (
    <>
      <path d="M22 6 Q24 20 38 22 Q24 24 22 40 Q20 24 6 22 Q20 20 22 6 Z" fill={C.pink} {...line} />
      <Face x={22} y={22} s={0.65} blush={false} />
      <Sparkle x={38} y={9} r={4} fill={C.gold} />
      <Sparkle x={39} y={36} r={2.6} fill={C.sky} />
    </>
  ),
  clipboard: (
    <>
      <rect x="9" y="8" width="30" height="35" rx="5" fill={C.yellow} {...line} />
      <rect x="17" y="5" width="14" height="7" rx="3" fill={C.lilac} {...line} />
      <path d="M15 31 L19 34.5 L27 27" fill="none" {...line} stroke={C.green} strokeWidth={3} />
      <path d="M29 33 H34" {...line} strokeWidth={1.8} opacity={0.5} />
      <Face x={24} y={20} s={0.85} />
    </>
  ),
  calendar: (
    <>
      <rect x="7" y="9" width="34" height="32" rx="6" fill={C.white} {...line} />
      <path d="M7 15 Q7 9 13 9 H35 Q41 9 41 15 V19 H7 Z" fill={C.rose} {...line} />
      <path d="M16 5 V12 M32 5 V12" {...line} strokeWidth={3} />
      <Face x={24} y={29} />
    </>
  ),
  clock: (
    <>
      <circle cx="24" cy="25" r="17" fill={C.sky} {...line} />
      <circle cx="24" cy="25" r="13" fill={C.white} {...line} strokeWidth={1.6} />
      <path d="M24 16 V25 L30 28" fill="none" {...line} stroke={C.rose} strokeWidth={2.6} />
      <circle cx="18.5" cy="22" r="1.4" fill={INK} />
      <circle cx="29.5" cy="20" r="1.4" fill={INK} />
      <path d="M12 8 L8 12 M36 8 L40 12" {...line} strokeWidth={3} />
    </>
  ),
  target: (
    <>
      <circle cx="22" cy="26" r="16" fill={C.pink} {...line} />
      <circle cx="22" cy="26" r="10.5" fill={C.white} {...line} strokeWidth={1.8} />
      <circle cx="22" cy="26" r="5" fill={C.rose} {...line} strokeWidth={1.8} />
      <path d="M23 25 L41 7" {...line} strokeWidth={2.6} />
      <path d="M41 7 L36 7 M41 7 L41 12" {...line} strokeWidth={2.6} />
      <circle cx="18.5" cy="22" r="1.2" fill={INK} />
      <circle cx="25.5" cy="22" r="1.2" fill={INK} />
    </>
  ),
  note: (
    <>
      <path d="M18 35 V10 L38 6 V31" fill="none" {...line} strokeWidth={3} />
      <path d="M18 13 L38 9" {...line} strokeWidth={5} />
      <ellipse cx="13" cy="35" rx="7" ry="5.5" fill={C.lilac} {...line} />
      <ellipse cx="33" cy="31" rx="7" ry="5.5" fill={C.mint} {...line} />
      <Face x={13} y={35} s={0.55} blush={false} />
      <Face x={33} y={31} s={0.55} blush={false} mood="wink" />
    </>
  ),
  lock: (
    <>
      <path d="M15 22 V16 Q15 7 24 7 Q33 7 33 16 V22" fill="none" {...line} strokeWidth={3.4} />
      <rect x="9" y="21" width="30" height="21" rx="6" fill={C.lilac} {...line} />
      <Face x={24} y={30} mood="calm" />
    </>
  ),
  bulb: (
    <>
      <path d="M24 5 Q37 5 37 18 Q37 25 31 29 V33 H17 V29 Q11 25 11 18 Q11 5 24 5 Z" fill={C.yellow} {...line} />
      <rect x="17" y="33" width="14" height="8" rx="3" fill={C.lilac} {...line} />
      <Face x={24} y={18} />
      <path d="M4 14 H7 M41 14 H44 M8 4 L10 6.5 M40 4 L38 6.5" {...line} strokeWidth={2} stroke={C.orange} />
    </>
  ),
  chat: (
    <>
      <path d="M6 12 Q6 6 12 6 H30 Q36 6 36 12 V22 Q36 28 30 28 H17 L10 34 V28 Q6 27 6 22 Z" fill={C.pink} {...line} />
      <path d="M22 22 Q22 18 26 18 H38 Q42 18 42 22 V32 Q42 36 38 36 V41 L32 36 H26 Q22 36 22 32 Z" fill={C.sky} {...line} />
      <Face x={18} y={15} s={0.7} blush={false} />
      <Face x={32} y={26} s={0.7} blush={false} mood="wink" />
    </>
  ),
  heart: (
    <>
      <path d="M24 41 Q6 30 6 17 Q6 8 15 8 Q21 8 24 14 Q27 8 33 8 Q42 8 42 17 Q42 30 24 41 Z" fill={C.rose} {...line} />
      <path d="M12 15 Q13 11 17 11" fill="none" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" />
      <Face x={24} y={22} />
    </>
  ),
  rocket: (
    <>
      <path d="M24 4 Q35 12 33 30 H15 Q13 12 24 4 Z" fill={C.white} {...line} />
      <circle cx="24" cy="17" r="5" fill={C.sky} {...line} strokeWidth={1.8} />
      <path d="M15 24 L8 32 L15 32 M33 24 L40 32 L33 32" fill={C.rose} {...line} />
      <path d="M19 30 Q24 44 29 30 Z" fill={C.orange} {...line} strokeWidth={1.8} />
      <circle cx="22" cy="16.5" r="1.1" fill={INK} />
      <circle cx="26" cy="16.5" r="1.1" fill={INK} />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type CuteName = keyof typeof ICONS;
export const CUTE_NAMES = Object.keys(ICONS) as CuteName[];

interface CuteIconProps {
  name: CuteName;
  className?: string;
  /** nhãn cho trình đọc màn hình; bỏ trống = icon trang trí */
  label?: string;
}

export function CuteIcon({ name, className, label }: CuteIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-10 shrink-0 overflow-visible", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {ICONS[name]}
    </svg>
  );
}
