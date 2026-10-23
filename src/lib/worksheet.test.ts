import { describe, expect, it } from "vitest";
import { buildCharIndex, loadAllVocab } from "./content";
import { loadHanziParts } from "./hanzi-parts";
import { addWords, charMeta, chunk, parseCustom, practiceRows, sheetChars } from "./worksheet";

const vocab = await loadAllVocab();
const index = buildCharIndex(vocab);
const hp = await loadHanziParts();

describe("vở tập viết — ví dụ bài chào hỏi", () => {
  const list = parseCustom("你 好 你好 王 老师 您 你们", vocab);

  it("lấy pinyin + nghĩa sẵn từ từ vựng", () => {
    expect(list.map((w) => w.hanzi)).toEqual(["你", "好", "你好", "王", "老师", "您", "你们"]);
    expect(list.find((w) => w.hanzi === "老师")?.pinyin).toBe("lǎo shī");
  });

  it("mỗi chữ luyện một trang, không lặp (你 có trong 你好, 你们)", () => {
    expect(sheetChars(list)).toEqual(["你", "好", "王", "老", "师", "您", "们"]);
  });

  it("đầu trang chữ: pinyin đúng âm trong từ, Hán Việt, bộ, từ chứa chữ", () => {
    const ni = charMeta("你", list, index, vocab, hp);
    expect(ni.pinyin).toBe("nǐ");
    expect(ni.radical).toMatch(/^亻/);
    expect(ni.words).toEqual(expect.arrayContaining(["你好", "你们"]));
    const shi = charMeta("师", list, index, vocab, hp);
    expect(shi.pinyin).toBe("shī");
    expect(shi.hanViet).toBe("sư");
  });

  it("từ không có sẵn → ghép pinyin từ từng chữ đã biết, nghĩa để người học điền", () => {
    const nihao = list.find((w) => w.hanzi === "你好")!;
    expect(nihao.pinyin).toBe("nǐ hǎo");
    expect(nihao.meaning).toBe("");
  });

  it("chữ ngoài từ vựng vẫn in được, pinyin/nghĩa để trống cho người học điền", () => {
    const [w] = parseCustom("鑫", vocab);
    expect(w).toMatchObject({ hanzi: "鑫", pinyin: "", meaning: "" });
  });

  it("thêm từ không trùng", () => {
    expect(addWords(list, parseCustom("你 上", vocab)).map((w) => w.hanzi)).toEqual([...list.map((w) => w.hanzi), "上"]);
  });
});

describe("bố cục", () => {
  it("chữ to 3 dòng: 2 tô + 1 tự viết; chữ nhỏ 5 dòng: 3 tô + 2 tự viết", () => {
    expect(practiceRows(3, 2).map((r) => r.kind)).toEqual(["trace", "trace", "blank"]);
    expect(practiceRows(5, 3).map((r) => r.kind)).toEqual(["trace", "trace", "trace", "blank", "blank"]);
  });

  it("hàng thứ tự nét dài thì xuống dòng", () => {
    expect(chunk([...Array(14).keys()], 12).map((r) => r.length)).toEqual([12, 2]);
  });
});
