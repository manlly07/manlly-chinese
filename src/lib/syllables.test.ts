import { describe, expect, it } from "vitest";
import { loadLessons, loadSyllables } from "./content";
import { inScope, pinyinScope, spell, spellNote, tonesOf, withTone } from "./syllables";

describe("spell — quy tắc viết pinyin", () => {
  it.each([
    ["ch", "a", "cha"],
    ["ch", "i", "chi"],
    ["j", "ü", "ju"],
    ["x", "üe", "xue"],
    ["q", "üan", "quan"],
    ["n", "ü", "nü"],
    ["l", "üe", "lüe"],
    ["g", "ui", "gui"],
    ["", "i", "yi"],
    ["", "ia", "ya"],
    ["", "iu", "you"],
    ["", "ing", "ying"],
    ["", "u", "wu"],
    ["", "ui", "wei"],
    ["", "un", "wen"],
    ["", "ueng", "weng"],
    ["", "ü", "yu"],
    ["", "üan", "yuan"],
    ["", "er", "er"],
  ])("%s + %s = %s", (i, f, s) => expect(spell(i, f)).toBe(s));

  it("chỉ giải thích khi cách viết khác ghép thẳng", () => {
    expect(spellNote("ch", "a")).toBeNull();
    expect(spellNote("j", "ü")).toContain("ju");
  });
});

describe("bảng âm tiết", async () => {
  const syllables = await loadSyllables();

  it("mọi âm tiết viết đúng quy tắc và đọc được ít nhất một thanh", () => {
    for (const s of syllables) {
      expect(spell(s.i, s.f), s.s).toBe(s.s);
      expect(tonesOf(s).length, s.s).toBeGreaterThan(0);
    }
  });

  it("dấu thanh đặt đúng chỗ", () => {
    const get = (s: string) => syllables.find((x) => x.s === s)!;
    expect(withTone(get("hao"), 3)).toBe("hǎo");
    expect(withTone(get("you"), 3)).toBe("yǒu");
    expect(withTone(get("gui"), 4)).toBe("guì");
    expect(withTone(get("liu"), 4)).toBe("liù");
    expect(withTone(get("nü"), 3)).toBe("nǚ");
  });
});

describe("pinyinScope", async () => {
  const lessons = await loadLessons();

  it("cộng dồn mảnh đã học, tách riêng mảnh mới của bài", () => {
    const s5 = pinyinScope(lessons, "py-05");
    expect([...s5.newInitials]).toEqual(["zh", "ch", "sh", "r", "z", "c", "s"]);
    expect(s5.initials.has("b")).toBe(true);
    expect(s5.finals.has("ou")).toBe(true);
    expect(s5.finals.has("an")).toBe(false);
    expect(s5.zero).toBe(false);
  });

  it("âm không phụ âm đầu chỉ có từ bài y/w", () => {
    const yi = { s: "yi", i: "", f: "i", t: ["衣", "", "", ""] };
    expect(inScope(yi, pinyinScope(lessons, "py-07"))).toBe(false);
    expect(inScope(yi, pinyinScope(lessons, "py-08"))).toBe(true);
  });
});
