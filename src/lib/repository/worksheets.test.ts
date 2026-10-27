import { describe, expect, it } from "vitest";
import { DEFAULT_SHEET_OPTIONS } from "@/lib/worksheet";
import { mergeProgress } from "./merge";
import { emptyProgress, migrateProgress } from "./migrate";
import type { SavedWorksheet } from "./types";

const ws = (id: string, title: string, updatedAt: number): SavedWorksheet => ({
  id,
  title,
  words: [{ hanzi: "你", pinyin: "nǐ", meaning: "bạn" }],
  options: DEFAULT_SHEET_OPTIONS,
  createdAt: 1,
  updatedAt,
});

describe("vở tập viết đã lưu (schema v4)", () => {
  it("migrate v3 → v4: thêm worksheets rỗng, giữ dữ liệu cũ", () => {
    const v3 = { cards: {}, lessons: { "hsk1-01": { best: 0.9 } }, history: {}, xp: 120, badges: [], favorites: [], tests: {}, mistakes: {} };
    const out = migrateProgress(v3, 3);
    expect(out.worksheets).toEqual({});
    expect(out.xp).toBe(120);
    expect(out.lessons["hsk1-01"].best).toBe(0.9);
  });

  it("migrate từ v1 cũng có worksheets", () => {
    expect(migrateProgress({ cards: {}, xp: 5 }, 1).worksheets).toEqual({});
  });

  it("gộp khi nhập: vở trùng id lấy bản sửa sau, vở khác id giữ cả hai", () => {
    const a = { ...emptyProgress(), worksheets: { w1: ws("w1", "Cũ", 100), w2: ws("w2", "Chỉ ở máy này", 50) } };
    const b = { ...emptyProgress(), worksheets: { w1: ws("w1", "Mới", 200), w3: ws("w3", "Chỉ trong file", 70) } };
    const m = mergeProgress(a, b).worksheets;
    expect(m.w1.title).toBe("Mới");
    expect(Object.keys(m).sort()).toEqual(["w1", "w2", "w3"]);
  });
});
