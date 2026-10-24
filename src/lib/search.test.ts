import { describe, expect, it } from "vitest";
import { loadAllVocab } from "./content";
import { searchWords } from "./search";

const vocab = await loadAllVocab();
const top = (q: string, n = 3) => searchWords(vocab, q).slice(0, n).map((w) => w.hanzi);

describe("tìm từ theo tiếng Việt / chữ Hán / pinyin", () => {
  it("chữ Hán", () => expect(top("你", 1)).toEqual(["你"]));

  it.each([
    ["nǐ", "你"],
    ["ni3", "你"],
    ["laoshi", "老师"],
    ["lao shi", "老师"],
  ])("pinyin %s → %s", (q, h) => expect(top(q, 1)).toEqual([h]));

  it.each([
    ["cảm ơn", "谢谢"],
    ["cam on", "谢谢"],
    ["thầy giáo", "老师"],
    ["học", "学习"],
  ])("tiếng Việt %s → %s", (q, h) => expect(top(q)).toContain(h));

  it("gõ có dấu thì không khớp nhầm chữ khác dấu", () => {
    const res = searchWords(vocab, "tôi").map((w) => w.hanzi);
    expect(res[0]).toBe("我");
    expect(res).not.toContain("来"); // đến / tới
    expect(res).not.toContain("黑"); // đen
  });

  it("không khớp giữa chữ: hao ≠ chào", () => {
    expect(searchWords(vocab, "hao").map((w) => w.hanzi)).not.toContain("欢迎");
  });

  it("truy vấn ngắn không khớp lỏng Hán Việt: ăn ≠ điện ảnh", () => {
    expect(searchWords(vocab, "ăn").map((w) => w.hanzi)).not.toContain("电影");
    expect(top("ăn", 1)).toEqual(["吃"]);
  });
});
