import { addDays, type DateKey, isoWeekKey } from "./date";

export interface DayStat {
  xp: number;
  reviews: number;
  correct: number;
  newWords: number;
  /** ước tính thời gian học, giây */
  seconds: number;
}

export const emptyDay = (): DayStat => ({ xp: 0, reviews: 0, correct: 0, newWords: 0, seconds: 0 });

export interface StreakResult {
  streak: number;
  /** những ngày được "đóng băng" (lỡ đúng 1 ngày, tối đa 1 lần/tuần ISO) */
  frozenDays: DateKey[];
  activeToday: boolean;
}

/**
 * Streak = số ngày hoạt động liên tiếp tính tới hôm nay (hoặc hôm qua nếu hôm nay chưa học).
 * Một ngày lỡ đơn lẻ được tự đóng băng nếu tuần ISO đó chưa dùng đóng băng.
 */
export function computeStreak(history: Record<DateKey, DayStat>, today: DateKey): StreakResult {
  const active = (k: DateKey) => (history[k]?.xp ?? 0) > 0;
  const activeToday = active(today);
  let cursor = activeToday ? today : addDays(today, -1);
  let streak = 0;
  const frozenDays: DateKey[] = [];
  const frozenWeeks = new Set<string>();

  for (;;) {
    if (active(cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
      continue;
    }
    const prev = addDays(cursor, -1);
    const week = isoWeekKey(cursor);
    if (streak > 0 && active(prev) && !frozenWeeks.has(week)) {
      frozenWeeks.add(week);
      frozenDays.push(cursor);
      cursor = prev;
      continue;
    }
    break;
  }
  return { streak, frozenDays, activeToday };
}
