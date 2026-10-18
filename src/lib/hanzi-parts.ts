import { type CharEntry, type ComponentInfo, hanChars, type Lesson, loadAllVocab, loadChars, loadComponents, loadRadicals, type Word } from "./content";
import { pick, shuffle } from "./random";

/** Cấu tạo chữ + thông tin (Hán Việt, nghĩa) của từng thành phần. */
export interface HanziParts {
  chars: Map<string, CharEntry>;
  info: Map<string, ComponentInfo>;
  /** thành phần đáng dạy riêng (bộ thủ, bộ phận lặp lại nhiều) — có trong components.json/radicals.json */
  teach: Set<string>;
  /** số chữ (trong từ vựng) có chứa thành phần — để ưu tiên dạy phần dùng lại nhiều */
  freq: Map<string, number>;
}

let partsPromise: Promise<HanziParts> | null = null;

export function loadHanziParts(): Promise<HanziParts> {
  partsPromise ??= Promise.all([loadChars(), loadComponents(), loadRadicals(), loadAllVocab()]).then(([chars, comps, radicals, words]) => {
    const info = new Map<string, ComponentInfo>();
    // chữ đơn có trong từ vựng → lấy Hán Việt + nghĩa đầu tiên
    for (const w of words) {
      if (hanChars(w.hanzi).length === 1 && !info.has(w.hanzi)) info.set(w.hanzi, { c: w.hanzi, hanViet: w.hanViet, meaning: w.meaning[0] });
    }
    const teach = new Set<string>();
    for (const r of radicals) {
      info.set(r.radical, { c: r.radical, hanViet: r.hanViet, meaning: r.meaning });
      teach.add(r.radical);
    }
    for (const c of comps) {
      info.set(c.c, c);
      teach.add(c.c);
    }
    const freq = new Map<string, number>();
    for (const e of chars.values()) for (const p of new Set(e.parts)) freq.set(p, (freq.get(p) ?? 0) + 1);
    return { chars, info, teach, freq };
  });
  return partsPromise;
}

/** Chữ của các từ trong bài, theo thứ tự xuất hiện, không lặp. */
export function lessonChars(lesson: Lesson, words: Map<string, Word>): string[] {
  return [...new Set(lesson.words.flatMap((id) => hanChars(words.get(id)?.hanzi ?? "")))];
}

/**
 * Bộ/thành phần mới của từng bài theo thứ tự lộ trình: lần đầu gặp trong chữ của bài, ưu tiên phần dùng lại nhiều.
 * Mỗi bài tối đa `max` phần; phần còn lại được dạy ở bài sau có gặp lại nó.
 */
export function partsByLesson(lessons: Lesson[], words: Map<string, Word>, hp: HanziParts, max = 6): Map<string, string[]> {
  const introduced = new Set<string>();
  const out = new Map<string, string[]>();
  for (const l of lessons) {
    const cands = new Set<string>();
    for (const c of lessonChars(l, words)) {
      for (const p of hp.chars.get(c)?.parts ?? []) if (hp.teach.has(p) && !introduced.has(p)) cands.add(p);
    }
    const chosen = [...cands].sort((a, b) => (hp.freq.get(b) ?? 0) - (hp.freq.get(a) ?? 0)).slice(0, max);
    chosen.forEach((p) => introduced.add(p));
    out.set(l.id, chosen);
  }
  return out;
}

/** "亻 + ? = 你": chọn thành phần còn thiếu. */
export interface ComposeQuestion {
  char: string;
  parts: string[];
  hole: number;
  options: string[];
  answer: string;
  /** gợi ý: pinyin + nghĩa của một từ chứa chữ */
  hint?: string;
}

/** Thành phần đã ghép với phần còn lại tạo ra chữ có thật khác → loại khỏi phương án nhiễu. */
function makesOtherChar(hp: HanziParts, parts: string[], hole: number, candidate: string, self: string): boolean {
  const key = parts.map((p, i) => (i === hole ? candidate : p)).join("");
  for (const e of hp.chars.values()) if (e.char !== self && e.parts.join("") === key) return true;
  return false;
}

export function composeQuestion(char: string, hp: HanziParts, hint?: string, pool?: string[]): ComposeQuestion | null {
  const e = hp.chars.get(char);
  if (!e || e.parts.length < 2) return null;
  // ưu tiên khoét phần gợi nghĩa (bộ) — phần người học vừa được dạy
  const known = e.parts.map((p, i) => [p, i] as const).filter(([p]) => hp.info.has(p));
  if (!known.length) return null;
  const sem = known.find(([p]) => p === e.semantic);
  const [answer, hole] = sem ?? pick(known);
  const cands = shuffle((pool?.length ? pool : [...hp.teach]).filter((p) => p !== answer && hp.info.has(p) && !makesOtherChar(hp, e.parts, hole, p, char)));
  const wrong = [...new Set(cands)].slice(0, 3);
  if (wrong.length < 3) return null;
  return { char, parts: e.parts, hole, options: shuffle([answer, ...wrong]), answer, hint };
}

/** Câu ghép chữ cho các chữ của một bài (tối đa `n`), nhiễu lấy từ bộ đã học tới bài này. */
export function composeQuestionsFor(chars: string[], hp: HanziParts, hintOf: (c: string) => string | undefined, pool: string[], n = 3): ComposeQuestion[] {
  const out: ComposeQuestion[] = [];
  for (const c of shuffle(chars)) {
    if (out.length >= n) break;
    const q = composeQuestion(c, hp, hintOf(c), pool.length >= 6 ? pool : undefined);
    if (q) out.push(q);
  }
  return out;
}

export const composeRef = (q: ComposeQuestion) => `c:${q.char}`;
