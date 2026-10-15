import { useEffect, useMemo, useState } from "react";
import { type Lesson, loadLessons } from "@/lib/content";
import { type CheckpointState, checkpointState, lessonStates, nextLesson } from "@/lib/path";
import { type Checkpoint, checkpointsOf, lessonNeedsReview } from "@/lib/review-mix";
import { useProgress } from "@/store/progress";

/** Lộ trình bài học + kiểm tra chặng + trạng thái mở khoá theo tiến độ hiện tại. */
export function usePath() {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const progressLessons = useProgress((s) => s.lessons);
  const placement = useProgress((s) => s.placement);
  const tests = useProgress((s) => s.tests);
  const cards = useProgress((s) => s.cards);

  useEffect(() => {
    void loadLessons().then(setLessons);
  }, []);

  return useMemo(() => {
    if (!lessons)
      return { lessons: null, states: new Map(), checkpoints: [] as Checkpoint[], cpStates: new Map<string, CheckpointState>(), next: undefined, nextCheckpoint: undefined, needsReview: [] as Lesson[], progress: progressLessons };
    const p = { lessons: progressLessons, placement, tests };
    const states = lessonStates(lessons, p);
    const checkpoints = checkpointsOf(lessons);
    const cpStates = new Map(checkpoints.map((cp) => [cp.id, checkpointState(cp, lessons, states, p)]));
    const now = Date.now();
    return {
      lessons,
      states,
      checkpoints,
      cpStates,
      next: nextLesson(lessons, states),
      nextCheckpoint: checkpoints.find((cp) => cpStates.get(cp.id) === "open"),
      needsReview: lessons.filter((l) => lessonNeedsReview(l, { cards, lessons: progressLessons }, now)),
      progress: progressLessons,
    };
  }, [lessons, progressLessons, placement, tests, cards]);
}
