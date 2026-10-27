import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { dateKey } from "@/lib/date";
import {
  emptyProgress,
  type ImportMode,
  type LessonId,
  mergeProgress,
  migrateProgress,
  PROGRESS_SCHEMA,
  type ProgressData,
  type SavedWorksheet,
  type WordId,
} from "@/lib/repository";
import { type Grade, newCard, schedule } from "@/lib/srs";
import { type DayStat, emptyDay } from "@/lib/streak";
import { lessonXp, reviewXp, testXp, XP } from "@/lib/xp";

interface ProgressActions {
  /** Chấm một thẻ SRS. `isNew` = lần đầu học từ này. Trả về XP nhận được. */
  review: (id: WordId, grade: Grade, opts?: { isNew?: boolean; now?: number; seconds?: number }) => number;
  /** Đưa từ vào SRS (chưa ôn) — vd. sau khi học bài, quiz sai. */
  addCards: (ids: WordId[], now?: number) => void;
  /** Ghi một câu quiz/bài tập. */
  recordAnswer: (correct: boolean, now?: number) => number;
  completeLesson: (id: LessonId, score: number, now?: number) => number;
  toggleFavorite: (id: WordId) => void;
  setPlacement: (lessonId: LessonId | null, now?: number) => void;
  /** Ghi kết quả bài kiểm tra; trả về XP (chỉ khi đạt `pass`). */
  recordTest: (id: string, score: number, opts?: { pass?: number; now?: number; seconds?: number }) => number;
  logMistake: (key: string, now?: number) => void;
  /** Trả lời đúng một lỗi cũ: giảm đếm, về 0 thì xoá khỏi sổ. */
  resolveMistake: (key: string) => void;
  addBadge: (badge: string) => void;
  /** Lưu (thêm hoặc ghi đè) một vở tập viết; giữ `createdAt` cũ. */
  saveWorksheet: (ws: Omit<SavedWorksheet, "createdAt" | "updatedAt">, now?: number) => void;
  deleteWorksheet: (id: string) => void;
  importData: (data: ProgressData, mode: ImportMode) => void;
  resetAll: () => void;
}

export type ProgressStore = ProgressData & ProgressActions;

function bumpDay(history: Record<string, DayStat>, now: number, patch: Partial<DayStat>) {
  const key = dateKey(now);
  const cur = history[key] ?? emptyDay();
  const next = { ...cur };
  for (const [k, v] of Object.entries(patch) as [keyof DayStat, number][]) next[k] = cur[k] + v;
  return { ...history, [key]: next };
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...emptyProgress(),

      review: (id, grade, { isNew = false, now = Date.now(), seconds = 8 } = {}) => {
        const gained = reviewXp(grade) + (isNew ? XP.newWord : 0);
        set((s) => ({
          cards: { ...s.cards, [id]: schedule(s.cards[id], grade, now) },
          xp: s.xp + gained,
          history: bumpDay(s.history, now, {
            xp: gained,
            reviews: 1,
            correct: grade > 0 ? 1 : 0,
            newWords: isNew ? 1 : 0,
            seconds,
          }),
        }));
        return gained;
      },

      addCards: (ids, now = Date.now()) =>
        set((s) => {
          const cards = { ...s.cards };
          for (const id of ids) {
            if (!cards[id]) cards[id] = newCard(now);
          }
          return { cards };
        }),

      recordAnswer: (correct, now = Date.now()) => {
        const gained = correct ? XP.quizCorrect : 0;
        set((s) => ({
          xp: s.xp + gained,
          history: bumpDay(s.history, now, { xp: gained, reviews: 1, correct: correct ? 1 : 0, seconds: 10 }),
        }));
        return gained;
      },

      completeLesson: (id, score, now = Date.now()) => {
        const gained = lessonXp(score);
        set((s) => {
          const prev = s.lessons[id];
          return {
            lessons: {
              ...s.lessons,
              [id]: { best: Math.max(prev?.best ?? 0, score), completedAt: prev?.completedAt ?? now },
            },
            xp: s.xp + gained,
            history: bumpDay(s.history, now, { xp: gained, seconds: 300 }),
          };
        });
        return gained;
      },

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
        })),

      setPlacement: (lessonId, now = Date.now()) => set({ placement: lessonId ? { lessonId, at: now } : undefined }),

      recordTest: (id, score, { pass = 0.8, now = Date.now(), seconds = 600 } = {}) => {
        const gained = testXp(score, pass);
        set((s) => {
          const prev = s.tests[id];
          return {
            tests: { ...s.tests, [id]: { best: Math.max(prev?.best ?? 0, score), last: score, attempts: (prev?.attempts ?? 0) + 1, at: now } },
            xp: s.xp + gained,
            history: bumpDay(s.history, now, { xp: gained, seconds }),
          };
        });
        return gained;
      },

      logMistake: (key, now = Date.now()) =>
        set((s) => ({ mistakes: { ...s.mistakes, [key]: { count: (s.mistakes[key]?.count ?? 0) + 1, last: now } } })),

      resolveMistake: (key) =>
        set((s) => {
          const cur = s.mistakes[key];
          if (!cur) return s;
          const mistakes = { ...s.mistakes };
          if (cur.count <= 1) delete mistakes[key];
          else mistakes[key] = { ...cur, count: cur.count - 1 };
          return { mistakes };
        }),

      addBadge: (badge) => set((s) => (s.badges.includes(badge) ? s : { badges: [...s.badges, badge] })),

      saveWorksheet: (ws, now = Date.now()) =>
        set((s) => ({ worksheets: { ...s.worksheets, [ws.id]: { ...ws, createdAt: s.worksheets[ws.id]?.createdAt ?? now, updatedAt: now } } })),

      deleteWorksheet: (id) =>
        set((s) => {
          const worksheets = { ...s.worksheets };
          delete worksheets[id];
          return { worksheets };
        }),

      importData: (data, mode) => set(mode === "replace" ? data : mergeProgress(progressSnapshot(get()), data)),

      resetAll: () => set(emptyProgress()),
    }),
    {
      name: "htt-progress",
      version: PROGRESS_SCHEMA,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => progressSnapshot(s),
      migrate: (persisted, from) => migrateProgress(persisted, from) as ProgressStore,
    },
  ),
);

/** Chỉ phần dữ liệu (không action) — để xuất/gộp. */
export function progressSnapshot(s: ProgressData = useProgress.getState()): ProgressData {
  return {
    cards: s.cards,
    lessons: s.lessons,
    history: s.history,
    xp: s.xp,
    badges: s.badges,
    favorites: s.favorites,
    placement: s.placement,
    tests: s.tests,
    mistakes: s.mistakes,
    worksheets: s.worksheets,
  };
}
