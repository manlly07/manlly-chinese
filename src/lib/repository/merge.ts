import type { DayStat } from "@/lib/streak";
import type { ProgressData } from "./types";

const maxDay = (a: DayStat, b: DayStat): DayStat => ({
  xp: Math.max(a.xp, b.xp),
  reviews: Math.max(a.reviews, b.reviews),
  correct: Math.max(a.correct, b.correct),
  newWords: Math.max(a.newWords, b.newWords),
  seconds: Math.max(a.seconds, b.seconds),
});

function mergeBy<T>(a: Record<string, T> = {}, b: Record<string, T> = {}, pick: (x: T, y: T) => T): Record<string, T> {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = out[k] ? pick(out[k], v) : v;
  return out;
}

/** Gộp: thẻ và vở tập viết lấy bản có updatedAt mới hơn; lịch sử lấy max theo ngày; XP lấy max. */
export function mergeProgress(a: ProgressData, b: ProgressData): ProgressData {
  const cards = { ...a.cards };
  for (const [id, card] of Object.entries(b.cards)) {
    if (!cards[id] || card.updatedAt > cards[id].updatedAt) cards[id] = card;
  }

  const lessons = { ...a.lessons };
  for (const [id, l] of Object.entries(b.lessons)) {
    const cur = lessons[id];
    lessons[id] = cur
      ? { best: Math.max(cur.best, l.best), completedAt: cur.completedAt ?? l.completedAt }
      : l;
  }

  const history = { ...a.history };
  for (const [day, s] of Object.entries(b.history)) {
    const cur = history[day];
    history[day] = cur ? maxDay(cur, s) : s;
  }

  return {
    cards,
    lessons,
    history,
    xp: Math.max(a.xp, b.xp),
    badges: [...new Set([...a.badges, ...b.badges])],
    favorites: [...new Set([...a.favorites, ...b.favorites])],
    tests: mergeBy(a.tests, b.tests, (x, y) => ({
      best: Math.max(x.best, y.best),
      last: x.at >= y.at ? x.last : y.last,
      attempts: Math.max(x.attempts, y.attempts),
      at: Math.max(x.at, y.at),
    })),
    mistakes: mergeBy(a.mistakes, b.mistakes, (x, y) => (x.last >= y.last ? x : y)),
    worksheets: mergeBy(a.worksheets, b.worksheets, (x, y) => (x.updatedAt >= y.updatedAt ? x : y)),
    placement: [a.placement, b.placement].filter(Boolean).sort((x, y) => y!.at - x!.at)[0],
  };
}
