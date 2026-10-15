import { useMemo } from "react";
import { useVocab } from "@/hooks/use-vocab";
import { dateKey } from "@/lib/date";
import { cardStatus } from "@/lib/srs";
import { computeStreak } from "@/lib/streak";
import { useProgress } from "@/store/progress";

export function useDashboardStats() {
  const cards = useProgress((s) => s.cards);
  const history = useProgress((s) => s.history);
  const { words } = useVocab();

  return useMemo(() => {
    const now = Date.now();
    const today = dateKey(now);
    const list = Object.values(cards);
    const levelMap = new Map<number, { level: number; total: number; started: number; mature: number }>();
    for (const w of words) {
      const l = levelMap.get(w.hsk2) ?? { level: w.hsk2, total: 0, started: 0, mature: 0 };
      l.total++;
      const c = cards[w.id];
      if (c) l.started++;
      if (cardStatus(c) === "mature") l.mature++;
      levelMap.set(w.hsk2, l);
    }
    return {
      streak: computeStreak(history, today).streak,
      xpToday: history[today]?.xp ?? 0,
      due: list.filter((c) => c.due <= now).length,
      learning: list.filter((c) => cardStatus(c) === "learning").length,
      mature: list.filter((c) => cardStatus(c) === "mature").length,
      levels: [...levelMap.values()].sort((a, b) => a.level - b.level),
    };
  }, [cards, history, words]);
}
