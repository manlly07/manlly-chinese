import { describe, expect, it } from "vitest";
import { loadLessons } from "./content";
import { lastIntroLesson, lessonStates, nextLesson, placementAdvances } from "./path";
import { checkpointsOf } from "./review-mix";

const lessons = await loadLessons();

describe("lộ trình có Chặng 0", () => {
  it("người mới bắt đầu từ bài pinyin đầu tiên, HSK 1 còn khoá", () => {
    const states = lessonStates(lessons, { lessons: {} });
    expect(nextLesson(lessons, states)?.id).toBe("py-01");
    expect(states.get("hsk1-01")).toBe("locked");
  });

  it("người học HSK từ trước không bị kéo về Chặng 0", () => {
    const p = { lessons: { "hsk1-01": { best: 0.9 }, "hsk1-02": { best: 0.85 } } };
    const states = lessonStates(lessons, p);
    expect(states.get("hsk1-03")).toBe("open");
    expect(nextLesson(lessons, states, p)?.id).toBe("hsk1-03");
  });

  it("qua kiểm tra nhanh pinyin → mở thẳng HSK 1", () => {
    const last = lastIntroLesson(lessons)!;
    expect(last.level).toBe(0);
    const states = lessonStates(lessons, { lessons: {}, placement: { lessonId: last.id, at: 0 } });
    expect(states.get("hsk1-01")).toBe("open");
  });

  it("xếp lớp chỉ tiến lên, không lùi", () => {
    const last = lastIntroLesson(lessons)!.id;
    expect(placementAdvances(lessons, undefined, last)).toBe(true);
    expect(placementAdvances(lessons, { lessonId: "hsk1-10", at: 0 }, last)).toBe(false);
  });

  it("Nhập môn không có kiểm tra chặng", () => {
    expect(checkpointsOf(lessons).every((cp) => cp.level > 0)).toBe(true);
  });
});
