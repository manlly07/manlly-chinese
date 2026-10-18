import type { Lesson, PinyinRule, Syllable } from "./content";
import type { Tone } from "./pinyin";
import { pick, shuffle } from "./random";
import { inScope, type PinyinScope, pinyinScope, tonesOf, withTone } from "./syllables";

/**
 * Câu hỏi pinyin. Dạng nghe (initial/final/syllable/tone/build) phát chữ đại diện của `syl` ở thanh `tone`.
 * - initial/final: nghe → chọn phụ âm đầu / vần · syllable: nghe → chọn âm tiết · tone: nghe → chọn thanh
 * - build: nghe → tự ghép phụ âm đầu + vần (đáp án "ch|a") · spell: ghép hai mảnh → chọn cách viết đúng
 */
export type PinyinQuestion =
  | { type: "initial" | "final" | "syllable" | "tone"; syl: Syllable; tone: Tone; options: string[]; answer: string }
  | { type: "build"; syl: Syllable; tone: Tone; initials: string[]; finals: string[]; answer: string }
  | { type: "spell"; parts: [string, string]; options: string[]; answer: string; explain: string };

/** Nhóm dễ nhầm — ưu tiên làm phương án nhiễu để luyện tai phân biệt. */
const INITIAL_GROUPS = [
  ["b", "p"], ["d", "t"], ["g", "k"], ["j", "q", "x"], ["zh", "ch", "sh"], ["z", "c", "s"],
  ["zh", "z"], ["ch", "c"], ["sh", "s"], ["j", "zh", "z"], ["q", "ch", "c"], ["x", "sh", "s"],
  ["h", "f"], ["n", "l"], ["r", "l"], ["m", "b"],
];
const FINAL_GROUPS = [
  ["an", "ang"], ["en", "eng"], ["in", "ing"], ["ian", "iang"], ["uan", "uang"], ["ong", "iong"],
  ["u", "ü"], ["ie", "üe"], ["ian", "üan"], ["in", "ün"], ["un", "ün"], ["ai", "ei"], ["ao", "ou"],
  ["e", "o"], ["iu", "ou"], ["ui", "ei"], ["ua", "uo"], ["uo", "ou"], ["a", "e"], ["i", "ü"],
];

function confusables(answer: string, pool: string[], groups: string[][], n: number): string[] {
  const near = shuffle(groups.filter((g) => g.includes(answer)).flat()).filter((x) => x !== answer && pool.includes(x));
  const rest = shuffle(pool).filter((x) => x !== answer);
  return [...new Set([...near, ...rest])].slice(0, n);
}

const randomTone = (syl: Syllable): Tone => pick(tonesOf(syl));

export interface DrillPool {
  /** mọi âm tiết trong phạm vi đã học */
  avail: Syllable[];
  initials: string[];
  finals: string[];
}

export function drillPool(syllables: Syllable[], scope: PinyinScope): DrillPool {
  const avail = syllables.filter((s) => inScope(s, scope) && tonesOf(s).length);
  return { avail, initials: [...scope.initials], finals: [...scope.finals] };
}

export function initialQuestion(syl: Syllable, pool: DrillPool): PinyinQuestion {
  const options = shuffle([syl.i, ...confusables(syl.i, pool.initials, INITIAL_GROUPS, 3)]);
  return { type: "initial", syl, tone: randomTone(syl), options, answer: syl.i };
}

export function finalQuestion(syl: Syllable, pool: DrillPool): PinyinQuestion {
  const options = shuffle([syl.f, ...confusables(syl.f, pool.finals, FINAL_GROUPS, 3)]);
  return { type: "final", syl, tone: randomTone(syl), options, answer: syl.f };
}

/** Nghe → chọn âm tiết; nhiễu là âm tiết cùng vần khác phụ âm đầu, hoặc cùng phụ âm đầu khác vần (cùng thanh). */
export function syllableQuestion(syl: Syllable, pool: DrillPool): PinyinQuestion {
  const tone = randomTone(syl);
  const sameFinal = pool.avail.filter((x) => x.f === syl.f && x.i !== syl.i);
  const sameInitial = pool.avail.filter((x) => x.i === syl.i && x.f !== syl.f);
  const nearI = new Set(INITIAL_GROUPS.filter((g) => g.includes(syl.i)).flat());
  const nearF = new Set(FINAL_GROUPS.filter((g) => g.includes(syl.f)).flat());
  const ranked = [
    ...shuffle(sameFinal.filter((x) => nearI.has(x.i))),
    ...shuffle(sameInitial.filter((x) => nearF.has(x.f))),
    ...shuffle([...sameFinal, ...sameInitial]),
    ...shuffle(pool.avail),
  ];
  const answer = withTone(syl, tone);
  const options = [...new Set(ranked.map((x) => withTone(x, tone)))].filter((x) => x !== answer).slice(0, 3);
  return { type: "syllable", syl, tone, options: shuffle([answer, ...options]), answer };
}

export function toneQuestion(syl: Syllable): PinyinQuestion {
  const tone = randomTone(syl);
  return { type: "tone", syl, tone, options: ([1, 2, 3, 4] as Tone[]).map((t) => withTone(syl, t)), answer: withTone(syl, tone) };
}

/** Nghe → tự ghép. Chỉ dùng cho âm tiết có phụ âm đầu. */
export function buildQuestion(syl: Syllable, pool: DrillPool): PinyinQuestion {
  return {
    type: "build",
    syl,
    tone: randomTone(syl),
    initials: shuffle([syl.i, ...confusables(syl.i, pool.initials, INITIAL_GROUPS, 3)]),
    finals: shuffle([syl.f, ...confusables(syl.f, pool.finals, FINAL_GROUPS, 3)]),
    answer: `${syl.i}|${syl.f}`,
  };
}

export const spellQuestions = (rules: PinyinRule[]): PinyinQuestion[] =>
  rules.flatMap((r) =>
    r.examples.map((e) => ({ type: "spell" as const, parts: e.parts, options: shuffle([e.answer, ...e.wrong]), answer: e.answer, explain: r.title })),
  );

/** Khoá sổ lỗi sai: "p:<âm tiết>" (cùng một âm tiết dù hỏi dạng nào). */
export const pinyinRef = (q: PinyinQuestion) => `p:${q.type === "spell" ? q.answer : q.syl.s}`;

interface BuildOpts {
  /** âm tiết đã trình diễn — hạn chế hỏi lại, ưu tiên âm tự ghép */
  demo?: string[];
  tones?: boolean;
  review?: boolean;
  rules?: PinyinRule[];
  size?: number;
}

/**
 * Bài tập cho một bài pinyin: luyện phần mới (phụ âm đầu/vần mới), và phần lớn câu ghép/nghe dùng âm tiết
 * KHÔNG có trong phần trình diễn — để người học tự ghép được âm mới (học ch + a rồi tự đọc được chi, chu…).
 */
export function buildPinyinExercises(syllables: Syllable[], scope: PinyinScope, opts: BuildOpts = {}): PinyinQuestion[] {
  const pool = drillPool(syllables, scope);
  if (!pool.avail.length) return [];
  const demo = new Set(opts.demo ?? []);
  const isNew = (s: Syllable) => scope.newInitials.has(s.i) || scope.newFinals.has(s.f) || (scope.newZero && !s.i);
  const focus = opts.review ? pool.avail : pool.avail.filter(isNew);
  const base = focus.length ? focus : pool.avail;
  const transfer = base.filter((s) => !demo.has(s.s));
  const prefer = (list: Syllable[]) => (list.length ? list : base);
  const withInitial = (list: Syllable[]) => list.filter((s) => s.i);

  // lấy n âm tiết: ưu tiên danh sách chính chưa hỏi, rồi phạm vi rộng hơn chưa hỏi; chỉ lặp lại khi hết âm mới
  const used = new Set<string>();
  const take = (list: Syllable[], n: number, wider: Syllable[] = base) => {
    const fresh = [...shuffle(list), ...shuffle(wider.filter((s) => list.includes(s) || !!s.i === list.some((x) => !!x.i)))].filter(
      (s, i, a) => !used.has(s.s) && a.indexOf(s) === i,
    );
    const out = [...fresh, ...shuffle(list)].slice(0, n);
    out.forEach((s) => used.add(s.s));
    return out;
  };

  const out: PinyinQuestion[] = [];
  if (opts.tones) take(prefer(withInitial(base)), 4).forEach((s) => out.push(toneQuestion(s)));

  const newInitials = opts.review ? shuffle(pool.initials).slice(0, 2) : shuffle([...scope.newInitials]).slice(0, 3);
  for (const ini of newInitials) {
    const cands = prefer(transfer).filter((s) => s.i === ini);
    const s = cands.length ? pick(cands) : pool.avail.find((x) => x.i === ini);
    if (s) out.push(initialQuestion(s, pool));
  }
  const newFinals = opts.review ? shuffle(pool.finals).slice(0, 2) : shuffle([...scope.newFinals]).slice(0, 3);
  for (const fin of newFinals) {
    const cands = withInitial(prefer(transfer)).filter((s) => s.f === fin);
    const s = cands.length ? pick(cands) : pool.avail.find((x) => x.f === fin && x.i);
    if (s) out.push(finalQuestion(s, pool));
  }

  const builds = withInitial(prefer(transfer));
  take(builds.length ? builds : withInitial(pool.avail), opts.review ? 4 : 3).forEach((s) => out.push(buildQuestion(s, pool)));
  take(prefer(transfer), opts.review ? 3 : 2).forEach((s) => out.push(syllableQuestion(s, pool)));
  if (!opts.tones) take(prefer(withInitial(base)), opts.review ? 2 : 1).forEach((s) => out.push(toneQuestion(s)));

  // quy tắc viết: 2–3 câu, nhiều hơn khi bài ít âm tiết để hỏi (vd. bài y/w)
  const spells = shuffle(spellQuestions(opts.rules ?? [])).slice(0, Math.max(opts.review ? 3 : 2, 12 - out.length));
  out.push(...spells);

  return shuffle(out).slice(0, opts.size ?? 16);
}

/** Ôn/kiểm tra toàn bộ phần pinyin của các bài cho trước (mọi quy tắc viết). */
export function buildPinyinReview(syllables: Syllable[], lessons: Lesson[], size = 15): PinyinQuestion[] {
  const pinyinLessons = lessons.filter((l) => l.pinyin);
  if (!pinyinLessons.length) return [];
  const scope = pinyinScope(pinyinLessons);
  const rules = pinyinLessons.flatMap((l) => l.pinyin!.rules);
  return buildPinyinExercises(syllables, scope, { review: true, rules, size });
}

/** Dựng lại một câu từ khoá sổ lỗi "p:<âm tiết>" (phạm vi: mọi âm tiết). */
export function pinyinFromRef(ref: string, syllables: Syllable[], lessons: Lesson[]): PinyinQuestion | null {
  const s = ref.slice(2);
  const syl = syllables.find((x) => x.s === s);
  const rule = lessons.flatMap((l) => l.pinyin?.rules ?? []).find((r) => r.examples.some((e) => e.answer === s));
  const pool = drillPool(syllables, pinyinScope(lessons.filter((l) => l.pinyin)));
  if (syl && syl.i && tonesOf(syl).length) return Math.random() < 0.5 ? buildQuestion(syl, pool) : syllableQuestion(syl, pool);
  if (rule) return spellQuestions([{ ...rule, examples: rule.examples.filter((e) => e.answer === s) }])[0] ?? null;
  if (syl && tonesOf(syl).length) return syllableQuestion(syl, pool);
  return null;
}
