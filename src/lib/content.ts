/** Loader dữ liệu học — lazy-load theo cấp bằng import() động. Page không import JSON trực tiếp. */

export interface Example {
  zh: string;
  py: string;
  vi: string;
}

export type Pos = "n" | "v" | "adj" | "adv" | "pron" | "num" | "mw" | "prep" | "conj" | "part" | "int" | "phr";

export interface Word {
  id: string;
  hanzi: string;
  pinyin: string;
  hanViet: string;
  meaning: string[];
  pos: Pos[];
  hsk2: number;
  hsk3: number | null;
  topics: string[];
  examples: Example[];
  audio?: string;
}

export interface VocabFile {
  level: number;
  words: Word[];
}

const vocabModules = import.meta.glob<VocabFile>("../content/vocab/hsk-*.json", { import: "default" });

/** Các cấp HSK đã có dữ liệu. */
export const availableVocabLevels = (): number[] =>
  Object.keys(vocabModules)
    .map((p) => Number(/hsk-(\d+)\.json$/.exec(p)?.[1]))
    .filter(Boolean)
    .sort((a, b) => a - b);

const cache = new Map<number, Promise<Word[]>>();

export function loadVocab(level: number): Promise<Word[]> {
  const loader = vocabModules[`../content/vocab/hsk-${level}.json`];
  if (!loader) return Promise.resolve([]);
  if (!cache.has(level)) cache.set(level, loader().then((f) => f.words));
  return cache.get(level)!;
}

export async function loadAllVocab(): Promise<Word[]> {
  return (await Promise.all(availableVocabLevels().map(loadVocab))).flat();
}

// ---------- Tra cứu chung ----------
let indexPromise: Promise<Map<string, Word>> | null = null;

/** Map id → Word cho mọi cấp đã có (dùng cho ôn tập, thống kê). */
export function loadWordIndex(): Promise<Map<string, Word>> {
  indexPromise ??= loadAllVocab().then((ws) => new Map(ws.map((w) => [w.id, w])));
  return indexPromise;
}

const HAN = /\p{Script=Han}/u;
export const hanChars = (s: string) => [...s].filter((c) => HAN.test(c));

/** Âm Hán Việt của từng chữ trong từ (rỗng nếu không khớp số chữ). */
export function hanVietPerChar(w: Word): string[] {
  const chars = hanChars(w.hanzi);
  const hv = w.hanViet.trim() ? w.hanViet.trim().split(/\s+/) : [];
  return hv.length === chars.length ? hv : [];
}

export interface CharInfo {
  char: string;
  pinyin: string[];
  hanViet: string[];
  /** các từ chứa chữ này, theo thứ tự cấp */
  words: Word[];
  level: number;
}

/** Thông tin chữ suy ra từ dữ liệu từ vựng (khi chưa có hanzi/chars.json). */
export function buildCharIndex(words: Word[]): Map<string, CharInfo> {
  const map = new Map<string, CharInfo>();
  for (const w of words) {
    const chars = hanChars(w.hanzi);
    const syl = w.pinyin.split(/\s+/);
    const hv = hanVietPerChar(w);
    chars.forEach((c, i) => {
      let info = map.get(c);
      if (!info) map.set(c, (info = { char: c, pinyin: [], hanViet: [], words: [], level: w.hsk2 }));
      const py = syl.length === chars.length ? syl[i].toLowerCase() : undefined;
      if (py && !info.pinyin.includes(py)) info.pinyin.push(py);
      if (hv[i] && !info.hanViet.includes(hv[i])) info.hanViet.push(hv[i]);
      if (!info.words.includes(w)) info.words.push(w);
      info.level = Math.min(info.level, w.hsk2);
    });
  }
  return map;
}

// ---------- Pinyin ----------
export interface PinyinSound {
  py: string;
  example: { hanzi: string; pinyin: string };
  tip: string;
  group?: string;
}
export interface PinyinData {
  initials: PinyinSound[];
  finals: PinyinSound[];
  tones: { tone: 1 | 2 | 3 | 4 | 5; name: string; shape: string; desc: string; contour: number[] }[];
  toneSets: { base: string; chars: string[]; pinyin: string[]; meaning: string[] }[];
  sandhi: { title: string; explain: string; examples: { hanzi: string; pinyin: string; actual: string }[] }[];
}

export const loadPinyin = (): Promise<PinyinData> => import("../content/pinyin.json").then((m) => m.default as PinyinData);

// ---------- Bài học, ngữ pháp, hội thoại, bộ thủ ----------
export interface OrderExercise { type: "order"; tokens: string[]; answer: string; vi?: string }
export interface FillExercise { type: "fill"; text: string; options: string[]; answer: string; vi?: string }
export interface ChooseExercise { type: "choose"; prompt: string; options: string[]; answer: string }
export type GrammarExercise = OrderExercise | FillExercise | ChooseExercise;

export interface GrammarPoint {
  id: string;
  level: number;
  title: string;
  pattern: string;
  explain: string;
  vnPitfalls: string[];
  examples: Example[];
  exercises: GrammarExercise[];
}

export interface DialogueLine extends Example {
  speaker: string;
  note?: string;
}
export interface Dialogue {
  id: string;
  level: number;
  title: string;
  lines: DialogueLine[];
}

export interface Lesson {
  id: string;
  level: number;
  title: string;
  goals: string[];
  words: string[];
  grammar: string[];
  dialogue: string | null;
  /** chỉ có ở bài Nhập môn pinyin (level 0) */
  pinyin?: PinyinSpec;
  /** bài Nét cơ bản & thứ tự viết (level 0) — nội dung trong hanzi/strokes.json */
  strokes?: boolean;
}

export interface StrokeInfo {
  /** ký tự nét (khối CJK Strokes), vd "㇐" */
  glyph: string;
  name: string;
  pinyin: string;
  vi: string;
  desc: string;
  /** chữ ví dụ để xem hoạt ảnh nét */
  example: string;
}

export interface StrokeData {
  strokes: StrokeInfo[];
  rules: { title: string; example: string; explain: string }[];
  exercises: ChooseExercise[];
}

/** Quy tắc viết pinyin; mỗi ví dụ là một câu hỏi "ghép rồi viết đúng". `parts[0]` rỗng = không có phụ âm đầu. */
export interface PinyinRule {
  title: string;
  explain: string;
  examples: { parts: [string, string]; answer: string; wrong: string[] }[];
}

export interface PinyinSpec {
  /** thanh mẫu / vận mẫu mới của bài */
  initials: string[];
  finals: string[];
  /** âm tiết trình diễn trong bước ghép vần; phần còn lại dùng để kiểm tra khả năng tự ghép */
  demo: string[];
  rules: PinyinRule[];
  /** bài dạy 4 thanh */
  tones?: boolean;
  /** từ bài này có âm tiết không phụ âm đầu (y, w) */
  zero?: boolean;
  /** bài tổng ôn: bài tập lấy từ mọi âm đã học */
  review?: boolean;
  /** dạy biến điệu */
  sandhi?: boolean;
}

/** Một âm tiết: `i` phụ âm đầu ("" nếu không có), `f` vận mẫu, `t` chữ đại diện cho thanh 1–4 ("" = không có chữ phổ biến). */
export interface Syllable {
  s: string;
  i: string;
  f: string;
  t: string[];
}

/** Cấu tạo chữ (sinh bởi scripts/build-chars.mjs). `semantic`/`phonetic`: phần gợi nghĩa/gợi âm của chữ hình thanh. */
export interface CharEntry {
  char: string;
  radical: string;
  parts: string[];
  semantic?: string;
  phonetic?: string;
}

/** Thành phần cấu tạo chữ (bộ thủ, bộ phận) có âm Hán Việt và nghĩa. */
export interface ComponentInfo {
  c: string;
  hanViet: string;
  meaning: string;
  note?: string;
}

export interface Radical {
  radical: string;
  variantOf?: string;
  hanViet: string;
  meaning: string;
  strokes: number;
  examples: string[];
}

const lessonModules = import.meta.glob<{ level: number; lessons: Lesson[] }>("../content/lessons/hsk-*.json", { import: "default" });
const grammarModules = import.meta.glob<{ level: number; items: GrammarPoint[] }>("../content/grammar/hsk-*.json", { import: "default" });
const dialogueModules = import.meta.glob<Dialogue[]>("../content/dialogues/hsk-*.json", { import: "default" });

const levelOf = (p: string) => Number(/hsk-(\d+)\.json$/.exec(p)?.[1]);
const byLevel = <T,>(mods: Record<string, () => Promise<T>>) =>
  Object.entries(mods)
    .sort((a, b) => levelOf(a[0]) - levelOf(b[0]))
    .map(([, load]) => load);

const memo = new Map<string, Promise<unknown>>();
const once = <T,>(key: string, fn: () => Promise<T>): Promise<T> => {
  if (!memo.has(key)) memo.set(key, fn());
  return memo.get(key) as Promise<T>;
};

/** Mọi bài học theo thứ tự lộ trình (cấp → số thứ tự). */
export const loadLessons = () =>
  once("lessons", async () => (await Promise.all(byLevel(lessonModules).map((l) => l()))).flatMap((f) => f.lessons));

export const loadGrammar = () =>
  once("grammar", async () => (await Promise.all(byLevel(grammarModules).map((l) => l()))).flatMap((f) => f.items));

export const loadDialogues = () => once("dialogues", async () => (await Promise.all(byLevel(dialogueModules).map((l) => l()))).flat());

export const loadRadicals = () => once("radicals", () => import("../content/hanzi/radicals.json").then((m) => m.default as Radical[]));

export const loadSyllables = () =>
  once("syllables", () => import("../content/syllables.json").then((m) => (m.default as { syllables: Syllable[] }).syllables));

export const loadChars = () =>
  once("chars", () => import("../content/hanzi/chars.json").then((m) => new Map((m.default as CharEntry[]).map((c) => [c.char, c]))));

export const loadStrokes = () => once("strokes", () => import("../content/hanzi/strokes.json").then((m) => m.default as StrokeData));

export const loadComponents = () => once("components", () => import("../content/hanzi/components.json").then((m) => m.default as ComponentInfo[]));
