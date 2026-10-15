import type { Word } from "./content";
import { addTone, stripTone, type Tone, toneOf } from "./pinyin";
import { pick, sampleDistinct, shuffle } from "./random";

export type QuizType = "hanzi-meaning" | "meaning-hanzi" | "audio-hanzi" | "pinyin-hanzi" | "tone";

export const QUIZ_TYPES: { type: QuizType; label: string; emoji: string }[] = [
  { type: "hanzi-meaning", label: "Hán → Nghĩa", emoji: "📖" },
  { type: "meaning-hanzi", label: "Nghĩa → Hán", emoji: "✍️" },
  { type: "audio-hanzi", label: "Nghe → Hán", emoji: "🎧" },
  { type: "pinyin-hanzi", label: "Pinyin → Hán", emoji: "🔤" },
  { type: "tone", label: "Chọn thanh", emoji: "🎵" },
];

export interface QuizOption {
  key: string;
  label: string;
  /** hiển thị bằng font chữ Hán / pinyin tô màu */
  kind: "hanzi" | "text" | "pinyin";
}

export interface QuizQuestion {
  type: QuizType;
  word: Word;
  options: QuizOption[];
  answer: string;
}

const meaningOf = (w: Word) => w.meaning.slice(0, 2).join("; ");

/** Các phương án pinyin sai thanh: đổi thanh của 1 âm tiết ngẫu nhiên. */
export function toneVariants(pinyin: string, n: number): string[] {
  const syl = pinyin.split(" ");
  const out = new Set<string>();
  for (let tries = 0; out.size < n && tries < 60; tries++) {
    const copy = [...syl];
    const i = Math.floor(Math.random() * syl.length);
    const cur = toneOf(syl[i]);
    const t = pick(([1, 2, 3, 4] as Tone[]).filter((x) => x !== cur));
    copy[i] = addTone(stripTone(syl[i]), t);
    const v = copy.join(" ");
    if (v !== pinyin) out.add(v);
  }
  return [...out];
}

export function makeQuestion(word: Word, type: QuizType, pool: Word[]): QuizQuestion {
  if (type === "tone") {
    const options = shuffle([word.pinyin, ...toneVariants(word.pinyin, 3)]).map((p) => ({ key: p, label: p, kind: "pinyin" as const }));
    return { type, word, options, answer: word.pinyin };
  }
  if (type === "hanzi-meaning") {
    const wrong = sampleDistinct(pool, 3, meaningOf, [meaningOf(word)]);
    const options = shuffle([word, ...wrong]).map((w) => ({ key: w.id, label: meaningOf(w), kind: "text" as const }));
    return { type, word, options, answer: word.id };
  }
  const wrong = sampleDistinct(pool, 3, (w) => w.hanzi, [word.hanzi]);
  const options = shuffle([word, ...wrong]).map((w) => ({ key: w.id, label: w.hanzi, kind: "hanzi" as const }));
  return { type, word, options, answer: word.id };
}

/** Bộ câu hỏi: lấy ngẫu nhiên `count` từ, xoay vòng các dạng đã chọn. Bỏ dạng "tone" cho từ có thanh nhẹ toàn bộ. */
export function buildQuiz(words: Word[], types: QuizType[], count: number): QuizQuestion[] {
  if (words.length < 4 || !types.length) return [];
  return shuffle(words)
    .slice(0, count)
    .map((w, i) => {
      let type = types[i % types.length];
      if (type === "tone" && w.pinyin.split(" ").every((s) => toneOf(s) === 5)) type = types.find((t) => t !== "tone") ?? "hanzi-meaning";
      return makeQuestion(w, type, words);
    });
}
