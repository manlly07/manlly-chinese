import { describe, expect, it } from "vitest";
import { loadKnowledge } from "@/test/knowledge";
import { emptyProgress } from "./repository";
import { buildDailyReview, buildMistakeSession, buildWeeklyTest } from "./review-mix";

const k = await loadKnowledge();
const progress = (patch: Partial<ReturnType<typeof emptyProgress>> = {}) => ({ ...emptyProgress(), ...patch });
const done = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, { best: 1, completedAt: 0 }]));

describe("ôn tập có Nhập môn", () => {
  it("mới học pinyin → ôn toàn câu pinyin", () => {
    const qs = buildDailyReview(k, progress({ lessons: done(["py-01", "py-02"]) }));
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((e) => e.kind === "pinyin")).toBe(true);
  });

  it("đã sang HSK → vẫn còn ít nhất 1 câu pinyin giữ nhịp", () => {
    const qs = buildDailyReview(k, progress({ lessons: done(["py-01", "py-02", "py-03", "hsk1-01", "hsk1-02"]) }));
    expect(qs.some((e) => e.kind === "pinyin")).toBe(true);
    expect(qs.some((e) => e.kind === "word")).toBe(true);
  });

  it("âm hay sai được hỏi lại trong ôn hằng ngày", () => {
    const qs = buildDailyReview(
      k,
      progress({ lessons: done(["py-01", "py-02", "hsk1-01"]), mistakes: { "p:lü": { count: 3, last: 1 }, "p:nü": { count: 2, last: 1 } } }),
    );
    const refs = qs.filter((e) => e.kind === "pinyin").map((e) => e.ref);
    expect(refs).toEqual(expect.arrayContaining(["p:lü", "p:nü"]));
  });

  it("kiểm tra tuần đủ 20 câu", () => {
    const qs = buildWeeklyTest(k, progress({ lessons: done(["py-01", "hsk1-01", "hsk1-02", "hsk1-03"]) }));
    expect(qs).toHaveLength(20);
  });
});

describe("sổ lỗi sai", () => {
  it("dựng lại đủ loại câu: từ, pinyin, ghép chữ, nét chữ", () => {
    const qs = buildMistakeSession(k, {
      "w:你|ni": { count: 1, last: 1 },
      "p:cha": { count: 1, last: 1 },
      "c:你": { count: 1, last: 1 },
      "s:#0": { count: 1, last: 1 },
    });
    expect(new Set(qs.map((e) => e.kind))).toEqual(new Set(["word", "pinyin", "compose", "stroke"]));
  });
});
