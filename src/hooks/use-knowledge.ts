import { useEffect, useState } from "react";
import { loadAllVocab, loadDialogues, loadGrammar, loadLessons } from "@/lib/content";
import type { Knowledge } from "@/lib/review-mix";

/** Toàn bộ nội dung đã đóng gói (bài, từ, ngữ pháp, hội thoại) cho các bộ sinh đề. */
export function useKnowledge(): Knowledge | null {
  const [k, setK] = useState<Knowledge | null>(null);
  useEffect(() => {
    let alive = true;
    void Promise.all([loadLessons(), loadAllVocab(), loadGrammar(), loadDialogues()]).then(([lessons, words, grammar, dialogues]) => {
      if (!alive) return;
      setK({
        lessons,
        words: new Map(words.map((w) => [w.id, w])),
        grammar: new Map(grammar.map((g) => [g.id, g])),
        dialogues: new Map(dialogues.map((d) => [d.id, d])),
      });
    });
    return () => {
      alive = false;
    };
  }, []);
  return k;
}
