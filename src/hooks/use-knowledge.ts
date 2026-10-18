import { useEffect, useState } from "react";
import { loadAllVocab, loadDialogues, loadGrammar, loadLessons, loadStrokes, loadSyllables } from "@/lib/content";
import { loadHanziParts } from "@/lib/hanzi-parts";
import type { Knowledge } from "@/lib/review-mix";

/** Toàn bộ nội dung đã đóng gói (bài, từ, ngữ pháp, hội thoại, âm tiết, cấu tạo chữ) cho các bộ sinh đề. */
export function useKnowledge(): Knowledge | null {
  const [k, setK] = useState<Knowledge | null>(null);
  useEffect(() => {
    let alive = true;
    void Promise.all([loadLessons(), loadAllVocab(), loadGrammar(), loadDialogues(), loadSyllables(), loadHanziParts(), loadStrokes()]).then(
      ([lessons, words, grammar, dialogues, syllables, parts, strokes]) => {
        if (!alive) return;
        setK({
          lessons,
          words: new Map(words.map((w) => [w.id, w])),
          grammar: new Map(grammar.map((g) => [g.id, g])),
          dialogues: new Map(dialogues.map((d) => [d.id, d])),
          syllables,
          parts,
          strokes,
        });
      },
    );
    return () => {
      alive = false;
    };
  }, []);
  return k;
}
