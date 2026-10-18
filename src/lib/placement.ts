import type { Lesson, Word } from "./content";
import { makeQuestion, type QuizQuestion } from "./quiz";
import { shuffle } from "./random";

export interface PlacementBlock {
  /** bài cuối của khối — đạt khối thì mở tới bài sau nó */
  lastLessonId: string;
  label: string;
  questions: QuizQuestion[];
}

/**
 * Chia lộ trình HSK thành các khối ~10 bài, mỗi khối 5 câu (Hán→nghĩa / nghe→Hán) từ từ của khối.
 * Bài Nhập môn pinyin không có từ nên không tạo khối — đạt khối đầu là mở luôn Chặng 0.
 */
export function buildPlacement(allLessons: Lesson[], words: Map<string, Word>, perBlock = 5, blockSize = 10): PlacementBlock[] {
  const lessons = allLessons.filter((l) => !l.pinyin);
  const blocks: PlacementBlock[] = [];
  const pool = [...words.values()];
  for (let i = 0; i < lessons.length; i += blockSize) {
    const group = lessons.slice(i, i + blockSize);
    const ws = group.flatMap((l) => l.words).map((id) => words.get(id)).filter((w): w is Word => !!w);
    if (!ws.length) continue;
    const qs = shuffle(ws)
      .slice(0, perBlock)
      .map((w, k) => makeQuestion(w, k % 2 ? "audio-hanzi" : "hanzi-meaning", pool.filter((p) => p.hsk2 === w.hsk2)));
    const last = group[group.length - 1];
    blocks.push({ lastLessonId: last.id, label: `HSK ${group[0].level} · bài ${group[0].id.slice(-2)}–${last.id.slice(-2)}`, questions: qs });
  }
  return blocks;
}

/** Bài cuối của chuỗi khối đạt liên tiếp từ đầu (≥ 4/5 mỗi khối); null nếu khối đầu chưa đạt. */
export function placementResult(blocks: PlacementBlock[], correctPerBlock: number[], pass = 0.8): string | null {
  let last: string | null = null;
  for (let i = 0; i < blocks.length; i++) {
    if ((correctPerBlock[i] ?? 0) / blocks[i].questions.length < pass) break;
    last = blocks[i].lastLessonId;
  }
  return last;
}
