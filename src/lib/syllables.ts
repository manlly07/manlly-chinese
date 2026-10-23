import audioManifest from "@/content/syllable-audio.json";
import type { Lesson, Syllable } from "./content";
import { addTone, type Tone } from "./pinyin";

// ---------- Âm thanh người thật (public/audio/syllables, sinh bởi scripts/fetch-syllable-audio.mjs) ----------
const NO_AUDIO = new Set(audioManifest.missing);

/** Có file thu âm cho âm tiết + thanh này không. */
export const hasAudio = (syl: Syllable, tone: Tone) => !NO_AUDIO.has(`${syl.s}${tone}`);

/** Đường dẫn file thu âm (ü → v), tương đối theo `base` của Vite để chạy được ở mọi host tĩnh. */
export const audioUrl = (syl: Syllable, tone: Tone) => `${import.meta.env.BASE_URL}audio/syllables/${syl.s.replace("ü", "v")}${tone}.mp3`;

/**
 * Cách viết chuẩn của phụ âm đầu + vần. `initial` rỗng = âm tiết không có phụ âm đầu.
 * j q x (và y) + ü… bỏ hai chấm: ju, xue · i… → y: yi, ya, you · u… → w: wu, wei, wen · ü… → yu: yu, yuan.
 * Khớp với `spell` trong scripts/validate-content.mjs.
 */
export function spell(initial: string, final: string): string {
  if (!initial) {
    if (final === "i" || final === "in" || final === "ing") return "y" + final;
    if (final === "u") return "wu";
    if (final.startsWith("ü")) return "yu" + final.slice(1);
    if (final === "iu") return "you";
    if (final === "ui") return "wei";
    if (final === "un") return "wen";
    if (final.startsWith("i")) return "y" + final.slice(1);
    if (final.startsWith("u")) return "w" + final.slice(1);
    return final;
  }
  if ("jqx".includes(initial) && final.startsWith("ü")) return initial + "u" + final.slice(1);
  return initial + final;
}

/** Âm tiết có dấu thanh ("cha", 2 → "chá"). */
export const withTone = (syl: Syllable, tone: Tone) => addTone(syl.s, tone);

/** Thanh phát được: có file thu âm, hoặc có chữ đại diện để giọng máy đọc. */
export const canPlay = (syl: Syllable, tone: Tone) => hasAudio(syl, tone) || !!syl.t[tone - 1];

/** Các thanh phát được của âm tiết. */
export const tonesOf = (syl: Syllable): Tone[] => ([1, 2, 3, 4] as Tone[]).filter((t) => canPlay(syl, t));

/** Chữ Hán để đọc âm tiết với thanh cho trước (TTS không đọc được pinyin trần). */
export const hanziFor = (syl: Syllable, tone: Tone) => syl.t[tone - 1] || "";

/** Lời giải thích ngắn khi cách viết khác với ghép thẳng (vd. j + ü → ju). */
export function spellNote(initial: string, final: string): string | null {
  const written = spell(initial, final);
  if (written === initial + final) return null;
  if (!initial) return `Không có phụ âm đầu: ${final} viết thành ${written}`;
  return `${initial} + ${final} viết thành ${written} — sau j q x, ü bỏ hai chấm (đọc vẫn là ü)`;
}

/** Thanh mẫu/vận mẫu đã học tính tới (và gồm) một bài pinyin; `new*` là phần mới của chính bài đó. */
export interface PinyinScope {
  initials: Set<string>;
  finals: Set<string>;
  zero: boolean;
  newInitials: Set<string>;
  newFinals: Set<string>;
  newZero: boolean;
}

export function pinyinScope(lessons: Lesson[], uptoId?: string): PinyinScope {
  const scope: PinyinScope = { initials: new Set(), finals: new Set(), zero: false, newInitials: new Set(), newFinals: new Set(), newZero: false };
  for (const l of lessons) {
    const p = l.pinyin;
    if (!p) continue;
    const last = l.id === uptoId;
    p.initials.forEach((x) => scope.initials.add(x));
    p.finals.forEach((x) => scope.finals.add(x));
    if (p.zero) scope.zero = true;
    if (last) {
      scope.newInitials = new Set(p.initials);
      scope.newFinals = new Set(p.finals);
      scope.newZero = !!p.zero;
      break;
    }
  }
  return scope;
}

export const inScope = (syl: Syllable, scope: PinyinScope) => (syl.i ? scope.initials.has(syl.i) : scope.zero) && scope.finals.has(syl.f);

/** Tra âm tiết theo phụ âm đầu + vần. */
export const syllableKey = (initial: string, final: string) => `${initial}|${final}`;
export const indexSyllables = (list: Syllable[]) => new Map(list.map((s) => [syllableKey(s.i, s.f), s]));
