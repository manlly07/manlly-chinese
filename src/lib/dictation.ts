import { pinyinKey } from "./pinyin";

const HAN = /\p{Script=Han}/u;
const strip = (s: string) => s.replace(/[\s，。？！、：；“”"'‘’.,?!:;…—-]/g, "");

export type DictationResult = { ok: boolean; mode: "hanzi" | "pinyin" };

/**
 * Chấm chép chính tả: chấp nhận chữ Hán (bỏ qua dấu câu) hoặc pinyin
 * (có/không dấu, có/không cách, dấu thanh bị bỏ qua — chỉ so âm).
 */
export function checkDictation(input: string, zh: string, py: string): DictationResult {
  if (HAN.test(input)) return { ok: strip(input) === strip(zh), mode: "hanzi" };
  return { ok: pinyinKey(strip(input)) === pinyinKey(strip(py)), mode: "pinyin" };
}
