import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadAllVocab, type Word } from "@/lib/content";
import { dateKey } from "@/lib/date";
import type { Grade } from "@/lib/srs";
import { useProgress } from "@/store/progress";
import { useSettings } from "@/store/settings";

export interface QueueItem {
  word: Word;
  isNew: boolean;
}

export interface SessionStats {
  done: number;
  correct: number;
  xp: number;
  newWords: number;
}

/** Hàng đợi một phiên ôn: thẻ đến hạn trước, rồi từ mới (giới hạn theo ngày). */
export function useReviewSession() {
  const [words, setWords] = useState<Word[] | null>(null);
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [stats, setStats] = useState<SessionStats>({ done: 0, correct: 0, xp: 0, newWords: 0 });
  /** tăng khi thoát phiên → tính lại kế hoạch theo tiến độ mới */
  const [planVersion, setPlanVersion] = useState(0);
  const queueRef = useRef<QueueItem[] | null>(null);
  queueRef.current = queue;
  const review = useProgress((s) => s.review);
  const newPerDay = useSettings((s) => s.newPerDay);

  useEffect(() => {
    void loadAllVocab().then(setWords);
  }, []);

  /** Đếm cho màn bắt đầu (đọc trạng thái hiện tại, không đăng ký re-render liên tục). */
  const plan = useMemo(() => {
    if (!words) return null;
    const { cards, history } = useProgress.getState();
    const now = Date.now();
    const byId = new Map(words.map((w) => [w.id, w]));
    const due = Object.entries(cards)
      .filter(([id, c]) => c.due <= now && byId.has(id))
      .sort((a, b) => a[1].due - b[1].due)
      .map(([id, c]) => ({ word: byId.get(id)!, isNew: c.reps === 0 && c.lapses === 0 && !c.lastReview }));
    const learnedToday = history[dateKey(now)]?.newWords ?? 0;
    const room = Math.max(0, newPerDay - learnedToday - due.filter((d) => d.isNew).length);
    const fresh = words.filter((w) => !cards[w.id]).slice(0, room).map((word) => ({ word, isNew: true }));
    return { due, fresh };
    // planVersion: tín hiệu tính lại (đọc store qua getState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, newPerDay, planVersion]);

  const start = useCallback(
    (mode: "all" | "due" | "new") => {
      if (!plan) return;
      const items = mode === "due" ? plan.due : mode === "new" ? plan.fresh : [...plan.due, ...plan.fresh];
      setStats({ done: 0, correct: 0, xp: 0, newWords: 0 });
      setQueue(items);
    },
    [plan],
  );

  const grade = useCallback(
    (g: Grade) => {
      const q = queueRef.current;
      if (!q?.length) return;
      const [cur, ...rest] = q;
      const xp = review(cur.word.id, g, { isNew: cur.isNew });
      setStats((s) => ({
        done: s.done + 1,
        correct: s.correct + (g > 0 ? 1 : 0),
        xp: s.xp + xp,
        newWords: s.newWords + (cur.isNew ? 1 : 0),
      }));
      // Quên → học lại cuối phiên
      const next = g === 0 ? [...rest, { word: cur.word, isNew: false }] : rest;
      queueRef.current = next;
      setQueue(next);
    },
    [review],
  );

  const exit = useCallback(() => {
    setQueue(null);
    setPlanVersion((v) => v + 1);
  }, []);

  return { loading: !words, plan, queue, current: queue?.[0], stats, start, grade, exit };
}
