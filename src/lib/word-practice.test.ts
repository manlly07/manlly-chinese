import { describe, expect, it } from "vitest";
import { loadAllVocab } from "./content";
import { loadHanziParts } from "./hanzi-parts";
import { buildWordPractice, isCustom, practiceWords } from "./word-practice";
import { DEFAULT_SHEET_OPTIONS, listPerPage, listPerRow, parseCustom, sheetPageCount, VOCAB_ROWS } from "./worksheet";

const vocab = await loadAllVocab();
const hp = await loadHanziParts();

describe("luyện các từ trong vở", () => {
  // 王 không có trong từ vựng: điền pinyin + nghĩa thì luyện được; 鑫 tự thêm mà để trống thì bỏ qua
  const sheet = parseCustom("你 老师 谢谢 王 吗", vocab).map((w) => (w.hanzi === "王" ? { ...w, pinyin: "wáng", meaning: "họ Vương" } : w));
  const { words, skipped } = practiceWords([...sheet, { hanzi: "鑫", pinyin: "", meaning: "" }], vocab);

  it("dùng dữ liệu từ vựng, từ tự thêm cần pinyin + nghĩa", () => {
    expect(words.map((w) => w.hanzi)).toEqual(["你", "老师", "谢谢", "王", "吗"]);
    expect(words.filter(isCustom).map((w) => w.hanzi)).toEqual(["王"]);
    expect(skipped).toEqual(["鑫"]);
  });

  it("mỗi từ × mỗi kỹ năng một câu; thanh nhẹ toàn bộ (吗) không hỏi thanh", () => {
    const ex = buildWordPractice(words, vocab, hp, ["meaning", "tone"]);
    expect(ex).toHaveLength(words.length * 2 - 1);
    const tones = ex.filter((e) => e.kind === "word" && e.q.type === "tone");
    expect(tones.map((e) => e.kind === "word" && e.q.word.hanzi)).not.toContain("吗");
  });

  it("phương án đủ 4, có đáp án; từ tự thêm không ghi sổ lỗi sai", () => {
    for (const e of buildWordPractice(words, vocab, hp, ["listen", "meaning", "recall", "pinyin"])) {
      if (e.kind !== "word") continue;
      expect(e.q.options).toHaveLength(4);
      expect(e.q.options.map((o) => o.key)).toContain(e.q.answer);
      expect(e.ref).toBe(isCustom(e.q.word) ? "" : `w:${e.q.word.id}`);
    }
  });

  it("xếp xen kẽ — cùng một từ không hỏi hai câu liền nhau", () => {
    const ex = buildWordPractice(words, vocab, hp, ["listen", "meaning", "recall", "pinyin", "tone"]);
    const ids = ex.map((e) => (e.kind === "word" ? e.q.word.hanzi : ""));
    for (let i = 1; i < ids.length; i++) if (ids[i] === ids[i - 1] && ids[i] !== "吗") expect.fail(`${ids[i]} hỏi liền 2 câu`);
  });

  it("ghép bộ: mỗi chữ có cấu tạo một câu", () => {
    const ex = buildWordPractice(words, vocab, hp, ["parts"]);
    expect(ex.every((e) => e.kind === "compose")).toBe(true);
    expect(ex.map((e) => e.kind === "compose" && e.q.char)).toContain("你");
  });

  it("không chọn kỹ năng nào → không có câu", () => {
    expect(buildWordPractice(words, vocab, hp, [])).toEqual([]);
  });
});

describe("số trang vở", () => {
  it("bảng từ chia trang theo VOCAB_ROWS + mỗi chữ một trang + trang trắng", () => {
    const o = (blankPages: number) => ({ ...DEFAULT_SHEET_OPTIONS, blankPages });
    expect(sheetPageCount(10, 12, o(1))).toBe(1 + 12 + 1);
    expect(sheetPageCount(VOCAB_ROWS + 1, 5, o(0))).toBe(2 + 5);
    expect(sheetPageCount(0, 0, o(2))).toBe(1 + 2);
  });

  it("danh sách gọn: mặc định ô nhỏ 5 dòng → 3 chữ/trang, 11 ô/dòng; ô to 5 dòng → 2 chữ/trang", () => {
    const list = { ...DEFAULT_SHEET_OPTIONS, layout: "list" as const, blankPages: 0 };
    expect(listPerRow("small")).toBe(11);
    expect(listPerRow("big")).toBe(6);
    expect(listPerPage(list)).toBe(3);
    expect(listPerPage({ ...list, listSize: "big" })).toBe(2);
    expect(listPerPage({ ...list, listSize: "big", listRows: 10 })).toBe(1);
    expect(sheetPageCount(4, 7, list)).toBe(3);
    expect(sheetPageCount(0, 0, { ...list, blankPages: 1 })).toBe(1 + 1);
  });
});
