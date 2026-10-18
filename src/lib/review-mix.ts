import { type Dialogue, type GrammarPoint, hanChars, type Lesson, type StrokeData, type Syllable, type Word } from "./content";
import { DAY, dateKey, isoWeekKey } from "./date";
import { composeExercise, type Exercise, grammarExercises, type LineRef, listenExercise, pinyinExercise, wordExercise } from "./exercises";
import { composeQuestion, composeQuestionsFor, type HanziParts } from "./hanzi-parts";
import { buildPinyinReview, pinyinFromRef } from "./pinyin-drill";
import type { MistakeEntry, ProgressData } from "./repository";
import { shuffle } from "./random";

/** Id bài kiểm tra tổng hợp của tuần ISO hiện tại, vd "weekly-2026-W42". */
export const weeklyTestId = (now = Date.now()) => `weekly-${isoWeekKey(dateKey(now))}`;
/** Id phiên ôn tổng hợp của ngày, vd "daily-2026-10-15". */
export const dailyReviewId = (now = Date.now()) => `daily-${dateKey(now)}`;

/** Nguồn kiến thức cho mọi bộ sinh đề. */
export interface Knowledge {
  lessons: Lesson[];
  words: Map<string, Word>;
  grammar: Map<string, GrammarPoint>;
  dialogues: Map<string, Dialogue>;
  syllables: Syllable[];
  parts: HanziParts;
  strokes: StrokeData;
}

type Progress = Pick<ProgressData, "lessons" | "placement" | "cards" | "mistakes">;

/** Bài đã học: có tiến độ, hoặc nằm trong phạm vi xếp lớp. */
export function learnedLessons(k: Knowledge, p: Pick<ProgressData, "lessons" | "placement">): Lesson[] {
  const placedUntil = p.placement ? k.lessons.findIndex((l) => l.id === p.placement!.lessonId) : -1;
  return k.lessons.filter((l, i) => p.lessons[l.id] || i <= placedUntil);
}

/** Lấy mẫu có trọng số, không lặp. `rand` để test được. */
export function weightedSample<T>(items: T[], weight: (x: T) => number, n: number, rand: () => number = Math.random): T[] {
  const pool = items.map((x) => ({ x, w: Math.max(0.0001, weight(x)) }));
  const out: T[] = [];
  while (out.length < n && pool.length) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = rand() * total;
    let i = 0;
    while (i < pool.length - 1 && (r -= pool[i].w) > 0) i++;
    out.push(pool[i].x);
    pool.splice(i, 1);
  }
  return out;
}

/** Độ "cần ôn" của một từ: đến hạn/quá hạn, hay quên, dễ nhầm, từng sai. */
export function wordWeight(id: string, p: Progress, now: number): number {
  const c = p.cards[id];
  const m = p.mistakes[`w:${id}`]?.count ?? 0;
  let w = 1 + m * 2;
  if (!c) return w + 1;
  if (c.due <= now) w += 3 + Math.min(3, (now - c.due) / DAY / 3);
  w += c.lapses * 1.5;
  if (c.ease < 2.2) w += 1;
  if (c.interval >= 21 && c.due > now) w *= 0.4; // đã thuộc chắc, ít hỏi
  return w;
}

const mistakeW = (m: Record<string, MistakeEntry>, ref: string) => 1 + (m[ref]?.count ?? 0) * 3;

function linesOf(k: Knowledge, lessons: Lesson[]): LineRef[] {
  return lessons.flatMap((l) => {
    const d = l.dialogue ? k.dialogues.get(l.dialogue) : undefined;
    return d ? d.lines.map((line, index) => ({ dialogueId: d.id, index, line })).filter((x) => x.line.vi.length < 60) : [];
  });
}

interface MixSpec {
  words: number;
  grammar: number;
  listen: number;
  /** câu ghép chữ từ bộ (chữ của các từ trong phạm vi) */
  compose?: number;
}

/** Gợi ý cho câu ghép chữ: pinyin + nghĩa của từ đầu tiên chứa chữ. */
export const charHint = (words: Iterable<Word>) => {
  const by = new Map<string, Word>();
  for (const w of words) for (const c of hanChars(w.hanzi)) if (!by.has(c)) by.set(c, w);
  return (c: string) => {
    const w = by.get(c);
    return w && `${w.hanzi} · ${w.pinyin} · ${w.meaning[0]}`;
  };
};

/** Trộn câu hỏi từ một tập bài theo số lượng từng loại, có trọng số theo tiến độ. */
function mix(k: Knowledge, scope: Lesson[], p: Progress, spec: MixSpec, now: number, rand?: () => number): Exercise[] {
  const ws = [...new Set(scope.flatMap((l) => l.words))].map((id) => k.words.get(id)).filter((w): w is Word => !!w);
  const pool = ws.length >= 4 ? ws : [...k.words.values()];
  const words = weightedSample(ws, (w) => wordWeight(w.id, p, now), spec.words, rand).map((w, i) => wordExercise(w, pool.filter((x) => x.hsk2 === w.hsk2), i));
  const gs = [...new Set(scope.flatMap((l) => l.grammar))].map((id) => k.grammar.get(id)).filter((g): g is GrammarPoint => !!g);
  const grammar = weightedSample(gs.flatMap(grammarExercises), (e) => mistakeW(p.mistakes, e.ref), spec.grammar, rand);
  const lines = linesOf(k, scope);
  const listen = weightedSample(lines, (l) => mistakeW(p.mistakes, `l:${l.dialogueId}#${l.index}`), spec.listen, rand).map((l) => listenExercise(l, lines));
  const chars = [...new Set(ws.flatMap((w) => hanChars(w.hanzi)))];
  const partPool = [...new Set(chars.flatMap((c) => k.parts.chars.get(c)?.parts ?? []))];
  const compose = spec.compose ? composeQuestionsFor(chars, k.parts, charHint(ws), partPool, spec.compose).map(composeExercise) : [];
  return [...words, ...grammar, ...listen, ...compose];
}

/** Chỉ mới học Nhập môn (cấp 0, chưa có bài HSK) → ôn/kiểm tra bằng câu pinyin. */
const introOnly = (scope: Lesson[]) => scope.length > 0 && scope.every((l) => l.level === 0);

/** Âm tiết đang nằm trong sổ lỗi (sai nhiều trước). */
const weakSyllables = (mistakes: Record<string, MistakeEntry>) =>
  Object.entries(mistakes)
    .filter(([key]) => key.startsWith("p:"))
    .sort((a, b) => b[1].count - a[1].count || b[1].last - a[1].last)
    .map(([key]) => key);

/**
 * Câu pinyin để trộn vào ôn tập sau khi đã sang HSK: âm hay sai trước, còn lại ôn ngẫu nhiên phần đã học —
 * để kỹ năng ghép vần không bị quên.
 */
export function pinyinMix(k: Knowledge, scope: Lesson[], mistakes: Record<string, MistakeEntry>, n: number): Exercise[] {
  const learned = scope.filter((l) => l.pinyin);
  if (!learned.length || n <= 0) return [];
  const out = weakSyllables(mistakes)
    .map((ref) => pinyinFromRef(ref, k.syllables, learned))
    .filter((q) => q !== null)
    .slice(0, n);
  if (out.length < n) out.push(...buildPinyinReview(k.syllables, learned, n - out.length));
  return out.slice(0, n).map(pinyinExercise);
}

/** Số câu pinyin trong ôn hằng ngày: 1 câu giữ nhịp, tới 3 câu khi có âm hay sai. */
const dailyPinyinCount = (scope: Lesson[], mistakes: Record<string, MistakeEntry>) =>
  scope.some((l) => l.pinyin) ? Math.max(1, Math.min(3, weakSyllables(mistakes).length)) : 0;

/** Ôn tổng hợp hằng ngày: mọi kiến thức đã học, ưu tiên phần sắp quên / hay sai. */
export function buildDailyReview(k: Knowledge, p: Progress, now = Date.now(), size = 15): Exercise[] {
  const scope = learnedLessons(k, p);
  if (!scope.length) return [];
  if (introOnly(scope)) return buildPinyinReview(k.syllables, scope, size).map(pinyinExercise);
  const listen = Math.min(3, linesOf(k, scope).length);
  const grammar = Math.min(4, scope.flatMap((l) => l.grammar).length * 3);
  const compose = 2;
  const pinyin = pinyinMix(k, scope, p.mistakes, dailyPinyinCount(scope, p.mistakes));
  const words = size - listen - grammar - compose - pinyin.length;
  return shuffle([...mix(k, scope, p, { words, grammar, listen, compose }, now), ...pinyin]);
}

/** Kiểm tra tổng hợp tuần: phủ đều toàn bộ đã học (20 câu). */
export function buildWeeklyTest(k: Knowledge, p: Progress, now = Date.now()): Exercise[] {
  const scope = learnedLessons(k, p);
  if (!scope.length) return [];
  if (introOnly(scope)) return buildPinyinReview(k.syllables, scope, 20).map(pinyinExercise);
  const pinyin = pinyinMix(k, scope, p.mistakes, 2);
  return shuffle([...mix(k, scope, p, { words: 9 - pinyin.length, grammar: 6, listen: 3, compose: 2 }, now), ...pinyin]);
}

// ---------- Kiểm tra chặng ----------
export const UNIT_SIZE = 5;

export interface Checkpoint {
  id: string;
  level: number;
  /** số thứ tự chặng trong cấp (1..) */
  unit: number;
  title: string;
  lessons: Lesson[];
  /** chặng cuối của cấp → kiểm tra cuối cấp (phủ cả cấp) */
  final: boolean;
}

/** Mỗi 5 bài trong một cấp tạo một chặng; chặng cuối cấp là kiểm tra cuối HSK. Nhập môn pinyin (cấp 0) không có chặng. */
export function checkpointsOf(lessons: Lesson[]): Checkpoint[] {
  const out: Checkpoint[] = [];
  for (const level of [...new Set(lessons.map((l) => l.level))].filter((x) => x > 0)) {
    const ls = lessons.filter((l) => l.level === level);
    const units = Math.ceil(ls.length / UNIT_SIZE);
    for (let u = 0; u < units; u++) {
      const final = u === units - 1;
      out.push({
        id: `cp-hsk${level}-${u + 1}`,
        level,
        unit: u + 1,
        title: final ? `Kiểm tra cuối HSK ${level}` : `Kiểm tra chặng ${u + 1}`,
        lessons: ls.slice(u * UNIT_SIZE, (u + 1) * UNIT_SIZE),
        final,
      });
    }
  }
  return out;
}

/** Đề kiểm tra chặng: chủ yếu nội dung chặng + một ít kiến thức cũ để kiểm tra “không quên”. */
export function buildCheckpointTest(k: Knowledge, cp: Checkpoint, p: Progress, now = Date.now()): Exercise[] {
  const idx = k.lessons.findIndex((l) => l.id === cp.lessons[0].id);
  const earlier = k.lessons.slice(0, idx);
  const levelScope = k.lessons.filter((l) => l.level === cp.level);
  const scope = cp.final ? levelScope : cp.lessons;
  const main = mix(k, scope, p, cp.final ? { words: 12, grammar: 8, listen: 3 } : { words: 10, grammar: 5, listen: 2 }, now);
  const oldScope = cp.final ? earlier.filter((l) => l.level < cp.level) : earlier;
  const old = oldScope.length ? mix(k, oldScope, p, { words: cp.final ? 2 : 3, grammar: 0, listen: 0 }, now) : [];
  return shuffle([...main, ...old]);
}

// ---------- Sổ lỗi sai ----------
/** Dựng lại câu hỏi từ sổ lỗi sai (lỗi nhiều + gần đây trước). */
export function buildMistakeSession(k: Knowledge, mistakes: Record<string, MistakeEntry>, size = 15): Exercise[] {
  const all = [...k.words.values()];
  const linePool = linesOf(k, k.lessons);
  const keys = Object.entries(mistakes)
    .sort((a, b) => b[1].count - a[1].count || b[1].last - a[1].last)
    .map(([key]) => key);
  const out: Exercise[] = [];
  for (const key of keys) {
    if (out.length >= size) break;
    const [kind, rest] = [key.slice(0, 1), key.slice(2)];
    if (kind === "w") {
      const w = k.words.get(rest);
      if (w) out.push(wordExercise(w, all.filter((x) => x.hsk2 === w.hsk2), out.length));
    } else if (kind === "g") {
      const [gid, i] = rest.split("#");
      const ex = k.grammar.get(gid)?.exercises[Number(i)];
      if (ex) out.push({ kind: "grammar", ex, ref: key });
    } else if (kind === "l") {
      const [did, i] = rest.split("#");
      const line = k.dialogues.get(did)?.lines[Number(i)];
      if (line) out.push(listenExercise({ dialogueId: did, index: Number(i), line }, linePool));
    } else if (kind === "p") {
      const q = pinyinFromRef(key, k.syllables, k.lessons);
      if (q) out.push(pinyinExercise(q));
    } else if (kind === "s") {
      const i = Number(rest.slice(1));
      const ex = k.strokes.exercises[i];
      if (ex) out.push({ kind: "stroke", ex, ref: key });
    } else if (kind === "c") {
      const q = composeQuestion(rest, k.parts, charHint(all)(rest));
      if (q) out.push(composeExercise(q));
    }
  }
  return shuffle(out);
}

// ---------- Bài cần ôn ("nứt") ----------
/** Bài đã xong nhưng ≥ 40% từ đã đến hạn ôn → cần ôn lại. */
export function lessonNeedsReview(l: Lesson, p: Pick<ProgressData, "cards" | "lessons">, now = Date.now()): boolean {
  if (!p.lessons[l.id] || !l.words.length) return false;
  const due = l.words.filter((id) => (p.cards[id]?.due ?? Infinity) <= now).length;
  return due / l.words.length >= 0.4;
}
