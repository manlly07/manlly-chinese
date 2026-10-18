import { loadAllVocab, loadDialogues, loadGrammar, loadLessons, loadStrokes, loadSyllables } from "@/lib/content";
import { loadHanziParts } from "@/lib/hanzi-parts";
import type { Knowledge } from "@/lib/review-mix";

/** Toàn bộ nội dung thật (như hook useKnowledge) — test chạy trên dữ liệu đã đóng gói, không dùng dữ liệu giả. */
export async function loadKnowledge(): Promise<Knowledge> {
  const [lessons, words, grammar, dialogues, syllables, parts, strokes] = await Promise.all([
    loadLessons(),
    loadAllVocab(),
    loadGrammar(),
    loadDialogues(),
    loadSyllables(),
    loadHanziParts(),
    loadStrokes(),
  ]);
  return {
    lessons,
    words: new Map(words.map((w) => [w.id, w])),
    grammar: new Map(grammar.map((g) => [g.id, g])),
    dialogues: new Map(dialogues.map((d) => [d.id, d])),
    syllables,
    parts,
    strokes,
  };
}
