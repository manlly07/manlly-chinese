import { describe, expect, it } from "vitest";
import { loadAllVocab, loadLessons } from "./content";
import { composeQuestion, lessonChars, loadHanziParts, partsByLesson } from "./hanzi-parts";

const hp = await loadHanziParts();
const lessons = await loadLessons();
const words = new Map((await loadAllVocab()).map((w) => [w.id, w]));

describe("cấu tạo chữ", () => {
  it("tách đúng chữ hình thanh quen thuộc", () => {
    expect(hp.chars.get("吗")).toMatchObject({ parts: ["口", "马"], semantic: "口", phonetic: "马" });
    expect(hp.chars.get("好")?.parts).toEqual(["女", "子"]);
    expect(hp.chars.get("人")?.parts).toEqual([]);
  });

  it("bộ hay gặp đều có Hán Việt/nghĩa tiếng Việt", () => {
    for (const p of ["亻", "口", "女", "氵", "讠", "扌", "木", "日"]) expect(hp.info.get(p)?.meaning, p).toBeTruthy();
  });
});

describe("bộ mới theo bài", () => {
  const plan = partsByLesson(lessons, words, hp);

  it("bài 1 dạy các bộ của 你 好 吗…", () => {
    expect(plan.get("hsk1-01")).toEqual(expect.arrayContaining(["亻", "女", "口"]));
  });

  it("mỗi bộ chỉ được dạy một lần, tối đa 6 bộ/bài", () => {
    const all = [...plan.values()].flat();
    expect(new Set(all).size).toBe(all.length);
    for (const ps of plan.values()) expect(ps.length).toBeLessThanOrEqual(6);
  });

  it("bài pinyin không có bộ mới", () => {
    expect(plan.get("py-01")).toEqual([]);
  });
});

describe("câu ghép chữ", () => {
  it("đáp án có trong phương án; phương án nhiễu không ghép ra chữ có thật khác", () => {
    for (const l of lessons.filter((x) => x.level > 0)) {
      for (const c of lessonChars(l, words)) {
        const q = composeQuestion(c, hp);
        if (!q) continue;
        expect(q.options).toContain(q.answer);
        expect(new Set(q.options).size).toBe(4);
        for (const o of q.options.filter((x) => x !== q.answer)) {
          const key = q.parts.map((p, i) => (i === q.hole ? o : p)).join("");
          const other = [...hp.chars.values()].find((e) => e.char !== c && e.parts.join("") === key);
          expect(other, `${c}: ${o} ghép ra ${other?.char}`).toBeUndefined();
        }
      }
    }
  });

  it("ưu tiên khoét bộ gợi nghĩa", () => {
    expect(composeQuestion("吗", hp)?.answer).toBe("口");
  });
});
