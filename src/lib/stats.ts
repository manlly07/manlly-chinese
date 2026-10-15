import { addDays, DAY, type DateKey, dateKey, parseDateKey } from "./date";
import { type CardState, cardStatus } from "./srs";
import { type DayStat, emptyDay } from "./streak";

export interface DayPoint extends DayStat {
  day: DateKey;
}

/** `n` ngày gần nhất (kết thúc hôm nay), ngày trống điền 0. */
export function lastDays(history: Record<DateKey, DayStat>, n: number, today: DateKey): DayPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const day = addDays(today, i - n + 1);
    return { day, ...emptyDay(), ...history[day] };
  });
}

export function distribution(cards: Record<string, CardState>, totalWords: number) {
  let learning = 0;
  let mature = 0;
  for (const c of Object.values(cards)) {
    if (cardStatus(c) === "mature") mature++;
    else learning++;
  }
  return { new: Math.max(0, totalWords - learning - mature), learning, mature };
}

/** Số thẻ đến hạn mỗi ngày trong `n` ngày tới (ngày đầu gồm cả thẻ quá hạn). */
export function forecast(cards: Record<string, CardState>, n: number, now: number): { day: DateKey; count: number }[] {
  const today = dateKey(now);
  const out = Array.from({ length: n }, (_, i) => ({ day: addDays(today, i), count: 0 }));
  const start = parseDateKey(today).getTime();
  for (const c of Object.values(cards)) {
    const idx = Math.max(0, Math.floor((c.due - start) / DAY));
    if (idx < n) out[idx].count++;
  }
  return out;
}

export function totals(history: Record<DateKey, DayStat>) {
  let reviews = 0;
  let correct = 0;
  let seconds = 0;
  let days = 0;
  for (const s of Object.values(history)) {
    reviews += s.reviews;
    correct += s.correct;
    seconds += s.seconds;
    if (s.xp > 0) days++;
  }
  return { reviews, correct, seconds, days, accuracy: reviews ? correct / reviews : 0 };
}

/** "1 giờ 25 phút" */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} giây`;
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  return `${h} giờ${m % 60 ? ` ${m % 60} phút` : ""}`;
}

const WEEKDAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
export const shortDay = (key: DateKey) => {
  const d = parseDateKey(key);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};
export const weekday = (key: DateKey) => WEEKDAY[parseDateKey(key).getDay()];
