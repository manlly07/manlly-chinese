import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Word } from "@/lib/content";
import { searchWords } from "@/lib/search";
import { useProgress } from "@/store/progress";

export type LevelFilter = "all" | "fav" | `${number}`;

/** Bộ lọc lưu trên URL (?q=&level=&topic=) để quay lại không mất. */
export function useVocabFilters(words: Word[]) {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const level = (params.get("level") ?? "all") as LevelFilter;
  const topic = params.get("topic") ?? "";
  const favorites = useProgress((s) => s.favorites);

  const set = (patch: Record<string, string>) =>
    setParams(
      (p) => {
        for (const [k, v] of Object.entries(patch)) {
          if (v) p.set(k, v);
          else p.delete(k);
        }
        return p;
      },
      { replace: true },
    );

  const byLevel = useMemo(() => {
    if (level === "fav") return words.filter((w) => favorites.includes(w.id));
    if (level === "all") return words;
    return words.filter((w) => w.hsk2 === Number(level));
  }, [words, level, favorites]);

  const topics = useMemo(() => {
    const count = new Map<string, number>();
    for (const w of byLevel) for (const t of w.topics) count.set(t, (count.get(t) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]);
  }, [byLevel]);

  const results = useMemo(() => {
    const list = topic ? byLevel.filter((w) => w.topics.includes(topic)) : byLevel;
    return searchWords(list, q);
  }, [byLevel, topic, q]);

  return { q, level, topic, topics, results, set };
}
