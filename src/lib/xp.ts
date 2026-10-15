import type { Grade } from "./srs";

export const XP = {
  reviewForgot: 1,
  review: 2,
  newWord: 3,
  quizCorrect: 5,
  lessonComplete: 20,
  lessonExcellentBonus: 10,
  testPass: 30,
  testExcellentBonus: 20,
} as const;

export function reviewXp(grade: Grade): number {
  return grade === 0 ? XP.reviewForgot : XP.review;
}

/** Kiểm tra chặng / tổng hợp: chỉ cộng khi đạt (≥ pass). */
export function testXp(score: number, pass: number): number {
  if (score < pass) return 0;
  return XP.testPass + (score >= 0.9 ? XP.testExcellentBonus : 0);
}

/** score: 0–1 */
export function lessonXp(score: number): number {
  return XP.lessonComplete + (score >= 0.9 ? XP.lessonExcellentBonus : 0);
}
