import { describe, expect, it } from "vitest";
import { loadLessons, loadSyllables } from "./content";
import { buildPinyinExercises, buildPinyinReview, pinyinFromRef, type PinyinQuestion } from "./pinyin-drill";
import { canPlay, inScope, pinyinScope } from "./syllables";

const lessons = await loadLessons();
const syllables = await loadSyllables();
const pinyinLessons = lessons.filter((l) => l.pinyin);

const build = (id: string) => {
  const idx = lessons.findIndex((l) => l.id === id);
  const p = lessons[idx].pinyin!;
  const rules = p.review ? lessons.slice(0, idx + 1).flatMap((l) => l.pinyin?.rules ?? []) : p.rules;
  return { scope: pinyinScope(lessons, id), qs: buildPinyinExercises(syllables, pinyinScope(lessons, id), { demo: p.demo, tones: p.tones, review: p.review, rules }) };
};

describe("bài tập pinyin của từng bài", () => {
  it.each(pinyinLessons.map((l) => l.id))("%s: câu hỏi hợp lệ, trong phạm vi đã học", (id) => {
    for (let run = 0; run < 20; run++) {
      const { scope, qs } = build(id);
      expect(qs.length).toBeGreaterThanOrEqual(8);
      for (const q of qs) {
        if (q.type === "build") {
          expect(q.initials).toContain(q.syl.i);
          expect(q.finals).toContain(q.syl.f);
        } else {
          expect(q.options).toContain(q.answer);
          expect(new Set(q.options).size).toBe(q.options.length);
          expect(q.options.length).toBeGreaterThanOrEqual(2);
        }
        if (q.type !== "spell") {
          expect(canPlay(q.syl, q.tone), `${q.syl.s}${q.tone} phải phát được (file thu âm hoặc chữ)`).toBe(true);
          expect(inScope(q.syl, scope), `${id} hỏi âm ngoài phạm vi: ${q.syl.s}`).toBe(true);
        }
      }
    }
  });

  it("phần lớn câu nghe/ghép dùng âm tiết chưa trình diễn (luyện tự ghép)", () => {
    for (const l of pinyinLessons.filter((x) => x.id >= "py-03" && !x.pinyin!.review)) {
      const demo = new Set(l.pinyin!.demo);
      let fresh = 0;
      let total = 0;
      for (let run = 0; run < 10; run++) {
        for (const q of build(l.id).qs) {
          if (q.type === "spell") continue;
          total++;
          if (!demo.has(q.syl.s)) fresh++;
        }
      }
      expect(fresh / total, l.id).toBeGreaterThan(0.6);
    }
  });
});

describe("ôn / sổ lỗi pinyin", () => {
  it("ôn toàn bộ Nhập môn: đủ câu", () => {
    expect(buildPinyinReview(syllables, lessons, 15)).toHaveLength(15);
  });

  it.each(["cha", "ju", "you", "wei", "xue"])("dựng lại câu từ khoá sổ lỗi p:%s", (s) => {
    const q = pinyinFromRef(`p:${s}`, syllables, lessons) as PinyinQuestion;
    expect(q).not.toBeNull();
    expect(q.type === "spell" ? q.answer : q.syl.s).toBe(s);
  });
});
