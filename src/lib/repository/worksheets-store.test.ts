import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SHEET_OPTIONS } from "@/lib/worksheet";
import { useProgress } from "@/store/progress";

describe("store: lưu / xoá vở", () => {
  beforeEach(() => useProgress.getState().resetAll());

  it("lưu lại giữ createdAt, cập nhật updatedAt; xoá bỏ khỏi danh sách", () => {
    const { saveWorksheet, deleteWorksheet } = useProgress.getState();
    const base = { id: "w1", title: "Xin chào!", words: [{ hanzi: "你", pinyin: "nǐ", meaning: "bạn" }], options: DEFAULT_SHEET_OPTIONS };
    saveWorksheet(base, 1000);
    saveWorksheet({ ...base, title: "Chào hỏi" }, 2000);
    const w = useProgress.getState().worksheets.w1;
    expect(w).toMatchObject({ title: "Chào hỏi", createdAt: 1000, updatedAt: 2000 });
    deleteWorksheet("w1");
    expect(useProgress.getState().worksheets).toEqual({});
  });
});
