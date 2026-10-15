import { DAY, MINUTE } from "./date";

/** 0 Quên · 1 Khó · 2 Được · 3 Dễ */
export type Grade = 0 | 1 | 2 | 3;

export const GRADE_LABELS: Record<Grade, string> = { 0: "Quên", 1: "Khó", 2: "Được", 3: "Dễ" };

export interface CardState {
  ease: number;
  /** khoảng ôn, đơn vị ngày */
  interval: number;
  reps: number;
  lapses: number;
  /** thời điểm đến hạn (ms) */
  due: number;
  lastReview?: number;
  updatedAt: number;
}

export type CardStatus = "new" | "learning" | "mature";

export const MATURE_INTERVAL = 21;
const MIN_EASE = 1.3;
const RELEARN_DELAY = 10 * MINUTE;

export function newCard(now: number): CardState {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, updatedAt: now };
}

/** SM-2 rút gọn 4 mức (xem skill srs-and-progress). Hàm thuần — không đọc đồng hồ. */
export function schedule(card: CardState | undefined, grade: Grade, now: number): CardState {
  const c = card ?? newCard(now);

  if (grade === 0) {
    return {
      ...c,
      reps: 0,
      lapses: c.lapses + 1,
      ease: Math.max(MIN_EASE, c.ease - 0.2),
      due: now + RELEARN_DELAY,
      lastReview: now,
      updatedAt: now,
    };
  }

  let interval: number;
  if (c.reps === 0) interval = grade === 3 ? 3 : 1;
  else if (c.reps === 1) interval = grade === 1 ? 3 : grade === 2 ? 6 : 8;
  else {
    const factor = grade === 1 ? 1.2 : grade === 2 ? c.ease : c.ease * 1.3;
    interval = Math.max(c.interval + 1, Math.round(c.interval * factor));
  }

  const easeDelta = grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0;
  return {
    ...c,
    interval,
    ease: Math.max(MIN_EASE, c.ease + easeDelta),
    reps: c.reps + 1,
    due: now + interval * DAY,
    lastReview: now,
    updatedAt: now,
  };
}

/** Khoảng (ms) tới lần ôn tiếp theo nếu chấm `grade` — để hiển thị trên nút. */
export function previewInterval(card: CardState | undefined, grade: Grade, now: number): number {
  return schedule(card, grade, now).due - now;
}

export function cardStatus(card: CardState | undefined): CardStatus {
  if (!card) return "new";
  return card.interval >= MATURE_INTERVAL ? "mature" : "learning";
}

export function isDue(card: CardState, now: number): boolean {
  return card.due <= now;
}
