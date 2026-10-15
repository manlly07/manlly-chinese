import type { DialogueLine, GrammarExercise, GrammarPoint, Word } from "./content";
import { makeQuestion, type QuizQuestion, type QuizType } from "./quiz";
import { shuffle } from "./random";

/**
 * Một câu bài tập. `ref` là khoá ổn định để ghi sổ lỗi sai:
 * "w:<wordId>" (từ vựng) · "g:<grammarId>#<i>" (bài tập ngữ pháp) · "l:<dialogueId>#<i>" (câu nghe).
 */
export type Exercise =
  | { kind: "grammar"; ex: GrammarExercise; ref: string }
  | { kind: "word"; q: QuizQuestion; ref: string }
  | { kind: "listen"; line: DialogueLine; options: string[]; answer: string; ref: string };

export type ExerciseCategory = "word" | "grammar" | "listen";
export const CATEGORY_LABELS: Record<ExerciseCategory, string> = { word: "Từ vựng", grammar: "Ngữ pháp", listen: "Nghe hiểu" };

const WORD_TYPES: QuizType[] = ["audio-hanzi", "hanzi-meaning", "tone", "meaning-hanzi", "pinyin-hanzi"];

export const wordExercise = (w: Word, pool: Word[], i: number, types: QuizType[] = WORD_TYPES): Exercise => ({
  kind: "word",
  q: makeQuestion(w, types[i % types.length], pool),
  ref: `w:${w.id}`,
});

export const grammarExercises = (g: GrammarPoint): Exercise[] =>
  g.exercises.map((ex, i) => ({ kind: "grammar", ex, ref: `g:${g.id}#${i}` }));

export interface LineRef {
  dialogueId: string;
  index: number;
  line: DialogueLine;
}

/** Nghe một câu hội thoại → chọn nghĩa đúng (phương án nhiễu lấy từ các câu khác). */
export function listenExercise(target: LineRef, pool: LineRef[]): Exercise {
  const wrong = shuffle(pool.filter((p) => p.line.vi !== target.line.vi))
    .map((p) => p.line.vi)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);
  return {
    kind: "listen",
    line: target.line,
    options: shuffle([target.line.vi, ...wrong]),
    answer: target.line.vi,
    ref: `l:${target.dialogueId}#${target.index}`,
  };
}

/**
 * Bài tập cho một bài học: mỗi từ mới 1 câu (xoay vòng các dạng) + toàn bộ bài tập ngữ pháp của bài.
 * Bài ôn tập (không có từ mới) lấy mẫu 10 từ từ `reviewPool`.
 */
export function buildLessonExercises(words: Word[], grammar: GrammarPoint[], pool: Word[], reviewPool: Word[] = []): Exercise[] {
  const base = words.length ? words : shuffle(reviewPool).slice(0, 10);
  const types: QuizType[] = ["audio-hanzi", "hanzi-meaning", "tone", "meaning-hanzi"];
  return [...shuffle(base.map((w, i) => wordExercise(w, pool, i, types))), ...shuffle(grammar.flatMap(grammarExercises))];
}

/** So khớp đáp án sắp xếp câu: bỏ dấu câu và khoảng trắng. */
export const normalizeZh = (s: string) => s.replace(/[\s，。？！、：；“”"'.,?!]/g, "");
