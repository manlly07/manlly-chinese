import type { Lesson } from "./content";
import type { LessonProgress, ProgressData } from "./repository";
import { type Checkpoint, checkpointsOf } from "./review-mix";

export const PASS_SCORE = 0.8;

export type LessonState = "done" | "open" | "locked";

type PathProgress = Pick<ProgressData, "lessons" | "placement"> & Partial<Pick<ProgressData, "tests">>;

const placedIndex = (lessons: Lesson[], p: PathProgress) => (p.placement ? lessons.findIndex((l) => l.id === p.placement!.lessonId) : -1);

/** Kiểm tra chặng đã đạt (hoặc được miễn nhờ xếp lớp). */
export function checkpointPassed(cp: Checkpoint, lessons: Lesson[], p: PathProgress): boolean {
  if ((p.tests?.[cp.id]?.best ?? 0) >= PASS_SCORE) return true;
  const last = lessons.findIndex((l) => l.id === cp.lessons[cp.lessons.length - 1].id);
  return last <= placedIndex(lessons, p);
}

/**
 * Trạng thái từng bài theo thứ tự lộ trình:
 * - bài đầu luôn mở; bài sau mở khi bài trước đạt ≥ 80% hoặc nằm trong phạm vi xếp lớp;
 * - bài đầu chặng mới còn cần đạt kiểm tra chặng trước — trừ khi bài đó đã có tiến độ (không khoá lại người đang học).
 */
export function lessonStates(lessons: Lesson[], progress: PathProgress): Map<string, LessonState> {
  const placedUntil = placedIndex(lessons, progress);
  const gateBefore = new Map<string, Checkpoint>(); // lessonId đầu chặng → kiểm tra chặng ngay trước
  const cps = checkpointsOf(lessons);
  for (const cp of cps) {
    const lastIdx = lessons.findIndex((l) => l.id === cp.lessons[cp.lessons.length - 1].id);
    const nextL = lessons[lastIdx + 1];
    if (nextL) gateBefore.set(nextL.id, cp);
  }
  const out = new Map<string, LessonState>();
  lessons.forEach((l, i) => {
    const p: LessonProgress | undefined = progress.lessons[l.id];
    if (p && p.best >= PASS_SCORE) return out.set(l.id, "done");
    const prev = lessons[i - 1];
    const prevPassed = !prev || (progress.lessons[prev.id]?.best ?? 0) >= PASS_SCORE;
    const gate = gateBefore.get(l.id);
    const gateOk = !gate || checkpointPassed(gate, lessons, progress) || !!p;
    out.set(l.id, i === 0 || i <= placedUntil + 1 || (prevPassed && gateOk) || !!p ? "open" : "locked");
  });
  return out;
}

export type CheckpointState = "done" | "open" | "locked";

/** Kiểm tra chặng mở khi mọi bài trong chặng đã xong. */
export function checkpointState(cp: Checkpoint, lessons: Lesson[], states: Map<string, LessonState>, p: PathProgress): CheckpointState {
  if (checkpointPassed(cp, lessons, p)) return "done";
  return cp.lessons.every((l) => states.get(l.id) === "done") ? "open" : "locked";
}

/**
 * Việc nên làm tiếp trên lộ trình: bài mở đầu tiên chưa xong.
 * Bỏ qua bài Nhập môn pinyin nằm trước bài xa nhất đã học — người học từ trước khi có Chặng 0 không bị kéo về.
 */
export function nextLesson(lessons: Lesson[], states: Map<string, LessonState>, progress: Pick<ProgressData, "lessons"> = { lessons: {} }): Lesson | undefined {
  let furthest = -1;
  lessons.forEach((l, i) => {
    if (progress.lessons[l.id]) furthest = i;
  });
  const skip = (l: Lesson, i: number) => !!l.pinyin && i < furthest;
  return (
    lessons.find((l, i) => states.get(l.id) === "open" && !skip(l, i)) ?? lessons.find((l, i) => states.get(l.id) !== "done" && !skip(l, i))
  );
}

/** Bài pinyin cuối — đạt "Kiểm tra nhanh pinyin" thì xếp lớp tới bài này (mở thẳng HSK 1). */
export const lastPinyinLesson = (lessons: Lesson[]) => lessons.filter((l) => l.pinyin).at(-1);

/** Xếp lớp mới chỉ được tiến lên, không lùi lại kết quả xếp lớp cũ. */
export function placementAdvances(lessons: Lesson[], current: ProgressData["placement"], lessonId: string): boolean {
  const cur = current ? lessons.findIndex((l) => l.id === current.lessonId) : -1;
  return lessons.findIndex((l) => l.id === lessonId) > cur;
}

/** Số sao theo điểm cao nhất: ≥80% 1 sao, ≥90% 2 sao, 100% 3 sao. */
export const stars = (best: number) => (best >= 1 ? 3 : best >= 0.9 ? 2 : best >= PASS_SCORE ? 1 : 0);
