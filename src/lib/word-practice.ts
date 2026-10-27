import { hanChars, type Word } from "./content";
import { composeExercise, type Exercise } from "./exercises";
import { composeQuestion, type HanziParts } from "./hanzi-parts";
import { toneOf } from "./pinyin";
import { makeQuestion, type QuizType } from "./quiz";
import { shuffle } from "./random";
import { charHint } from "./review-mix";
import type { SheetWord } from "./worksheet";

/** Luyện các từ người dùng tự chọn (vd. từ trong vở tập viết), theo từng kỹ năng. */
export type PracticeSkill = "listen" | "meaning" | "recall" | "pinyin" | "tone" | "parts";

export const PRACTICE_SKILLS: { id: PracticeSkill; label: string; hint: string; type?: QuizType }[] = [
  { id: "listen", label: "Nghe", hint: "Nghe đọc → chọn chữ Hán", type: "audio-hanzi" },
  { id: "meaning", label: "Hiểu nghĩa", hint: "Nhìn chữ Hán → chọn nghĩa", type: "hanzi-meaning" },
  { id: "recall", label: "Nhớ mặt chữ", hint: "Đọc nghĩa → chọn chữ Hán", type: "meaning-hanzi" },
  { id: "pinyin", label: "Đọc pinyin", hint: "Nhìn pinyin → chọn chữ Hán", type: "pinyin-hanzi" },
  { id: "tone", label: "Thanh điệu", hint: "Chọn pinyin đúng thanh", type: "tone" },
  { id: "parts", label: "Ghép bộ", hint: "Điền bộ còn thiếu của chữ" },
];

export const DEFAULT_SKILLS: PracticeSkill[] = ["listen", "meaning", "recall", "tone"];

/** Id của từ tự thêm (không có trong từ vựng) — không ghi sổ lỗi sai / SRS vì không dựng lại được. */
export const CUSTOM_ID = "custom:";
export const isCustom = (w: Word) => w.id.startsWith(CUSTOM_ID);

/**
 * Từ trong vở → Word để ra đề. Từ có trong từ vựng dùng dữ liệu gốc;
 * từ tự thêm cần có pinyin + nghĩa (bạn tự điền), thiếu thì bỏ qua (`skipped`).
 */
export function practiceWords(sheet: SheetWord[], vocab: Word[]): { words: Word[]; skipped: string[] } {
  const byHanzi = new Map<string, Word>();
  for (const w of vocab) if (!byHanzi.has(w.hanzi)) byHanzi.set(w.hanzi, w);
  const words: Word[] = [];
  const skipped: string[] = [];
  for (const s of sheet) {
    const known = byHanzi.get(s.hanzi);
    if (known) words.push(known);
    else if (s.pinyin.trim() && s.meaning.trim())
      words.push({
        id: CUSTOM_ID + s.hanzi,
        hanzi: s.hanzi,
        pinyin: s.pinyin.trim(),
        hanViet: s.hanViet ?? "",
        meaning: s.meaning.split(/\s*;\s*/).filter(Boolean),
        pos: [],
        hsk2: 0,
        hsk3: null,
        topics: [],
        examples: [],
      });
    else skipped.push(s.hanzi);
  }
  return { words, skipped };
}

/** Có ít nhất một âm tiết mang dấu thanh (toàn thanh nhẹ / gõ không dấu thì không hỏi thanh điệu). */
const hasTone = (pinyin: string) => pinyin.split(/\s+/).some((s) => toneOf(s) !== 5);

/** Xếp xen kẽ: lần lượt từng từ, mỗi lượt lấy một câu của từ đó — cùng một từ không bị hỏi liền nhau. */
function interleave<T>(groups: T[][]): T[] {
  const queues = shuffle(groups.map((g) => shuffle(g))).filter((g) => g.length);
  const out: T[] = [];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!);
  return out;
}

/**
 * Bộ câu cho danh sách từ: mỗi từ × mỗi kỹ năng đã chọn một câu; "Ghép bộ" hỏi mỗi chữ (có cấu tạo) một câu.
 * Phương án nhiễu lấy từ cùng cấp HSK (+ các từ đang luyện).
 */
export function buildWordPractice(words: Word[], vocab: Word[], hp: HanziParts | null, skills: PracticeSkill[]): Exercise[] {
  const types = PRACTICE_SKILLS.filter((s) => skills.includes(s.id) && s.type);
  const poolOf = (w: Word) => [...words, ...vocab.filter((x) => x.hsk2 === (w.hsk2 || 1))].filter((x) => x.hanzi !== w.hanzi);

  const groups = words.map((w) => {
    const pool = poolOf(w);
    return types
      .filter((t) => t.id !== "tone" || hasTone(w.pinyin))
      .map((t): Exercise => ({ kind: "word", q: makeQuestion(w, t.type!, pool), ref: isCustom(w) ? "" : `w:${w.id}` }));
  });

  if (skills.includes("parts") && hp) {
    const hint = charHint(words);
    const chars = [...new Set(words.flatMap((w) => hanChars(w.hanzi)))];
    for (const c of chars) {
      const q = composeQuestion(c, hp, hint(c));
      if (q) groups.push([composeExercise(q)]);
    }
  }
  return interleave(groups);
}
