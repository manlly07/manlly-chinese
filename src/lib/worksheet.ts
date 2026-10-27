import { buildCharIndex, type CharInfo, hanChars, type Word } from "./content";
import type { HanziParts } from "./hanzi-parts";

/** Một từ trên vở tập viết — lấy từ từ vựng hoặc người học tự nhập (pinyin/nghĩa sửa được). */
export interface SheetWord {
  hanzi: string;
  pinyin: string;
  meaning: string;
  hanViet?: string;
}

export type GridStyle = "mi" | "tian";
export type TraceStyle = "fill" | "dashed";

/** Kiểu vở (lưu cùng vở). */
export interface SheetOptions {
  grid: GridStyle;
  traceStyle: TraceStyle;
  /** số dòng chữ to / số dòng trong đó để tô */
  bigRows: number;
  bigTrace: number;
  smallRows: number;
  smallTrace: number;
  /** số trang toàn ô trống ở cuối vở (0 = không thêm) */
  blankPages: number;
}

export const DEFAULT_SHEET_OPTIONS: SheetOptions = { grid: "mi", traceStyle: "fill", bigRows: 3, bigTrace: 2, smallRows: 5, smallTrace: 3, blankPages: 1 };

export const fromWord = (w: Word): SheetWord => ({ hanzi: w.hanzi, pinyin: w.pinyin, meaning: w.meaning.slice(0, 2).join("; "), hanViet: w.hanViet });

/**
 * Từ người học gõ vào: chữ Hán ngăn cách bởi dấu cách/phẩy. Từ có trong từ vựng thì lấy sẵn pinyin + nghĩa.
 * Bỏ qua phần không có chữ Hán.
 */
export function parseCustom(text: string, vocab: Word[]): SheetWord[] {
  const byHanzi = new Map(vocab.map((w) => [w.hanzi, w]));
  let index: Map<string, CharInfo> | null = null;
  // từ không có sẵn (你好, 你们…) → ghép pinyin / Hán Việt từ từng chữ đã biết; nghĩa để người học tự điền
  const compose = (h: string): SheetWord => {
    index ??= buildCharIndex(vocab);
    const infos = hanChars(h).map((c) => index!.get(c));
    const all = infos.every((x) => x?.pinyin[0]);
    return {
      hanzi: h,
      pinyin: all ? infos.map((x) => x!.pinyin[0]).join(" ") : "",
      meaning: "",
      hanViet: infos.every((x) => x?.hanViet[0]) ? infos.map((x) => x!.hanViet[0]).join(" ") : undefined,
    };
  };
  return text
    .split(/[\s,，、;；]+/)
    .map((t) => hanChars(t).join(""))
    .filter(Boolean)
    .map((h) => {
      const w = byHanzi.get(h);
      return w ? fromWord(w) : compose(h);
    });
}

/** Thêm từ, không trùng (theo chữ Hán). */
export function addWords(list: SheetWord[], more: SheetWord[]): SheetWord[] {
  const seen = new Set(list.map((w) => w.hanzi));
  return [...list, ...more.filter((w) => !seen.has(w.hanzi) && seen.add(w.hanzi))];
}

/** Chữ cần luyện viết theo thứ tự xuất hiện, mỗi chữ một lần (你 trong 你好 và 你们 chỉ luyện một trang). */
export const sheetChars = (words: SheetWord[]) => [...new Set(words.flatMap((w) => hanChars(w.hanzi)))];

/** Pinyin của chữ thứ i trong từ (dữ liệu: âm tiết cách nhau dấu cách). Rỗng nếu không khớp số chữ. */
export function syllableOf(w: SheetWord, i: number): string {
  const syl = w.pinyin.trim().split(/\s+/);
  return syl.length === hanChars(w.hanzi).length ? syl[i] : "";
}

/** Thông tin đầu trang luyện một chữ (khớp CharMeta của WorksheetSheet). */
export interface CharMetaData {
  char: string;
  pinyin: string;
  hanViet: string;
  meaning: string;
  radical: string;
  words: string[];
}

/**
 * Suy ra pinyin / Hán Việt / nghĩa / bộ / từ chứa chữ: ưu tiên từ người học đã chọn (pinyin đúng âm trong từ đó),
 * rồi tới từ vựng (chữ đơn có nghĩa riêng), cuối cùng ghi "trong từ …".
 */
export function charMeta(c: string, sheet: SheetWord[], index: Map<string, CharInfo>, vocab: Word[], hp?: HanziParts | null): CharMetaData {
  const host = sheet.find((w) => hanChars(w.hanzi).includes(c));
  const pos = host ? hanChars(host.hanzi).indexOf(c) : -1;
  const info = index.get(c);
  const hv = host?.hanViet?.trim().split(/\s+/) ?? [];
  const ownSheet = sheet.find((w) => w.hanzi === c && w.meaning);
  const ownVocab = vocab.find((w) => w.hanzi === c);
  const meaning =
    ownSheet?.meaning ??
    (ownVocab ? ownVocab.meaning.slice(0, 2).join("; ") : host ? `trong “${host.hanzi}”${host.meaning ? `: ${host.meaning}` : ""}` : "");
  const rad = hp?.chars.get(c)?.radical ?? "";
  const radHv = rad ? hp?.info.get(rad)?.hanViet : "";
  return {
    char: c,
    pinyin: (host && syllableOf(host, pos)) || info?.pinyin[0] || "",
    hanViet: (host && hv.length === hanChars(host.hanzi).length ? hv[pos] : "") || info?.hanViet[0] || "",
    meaning,
    radical: rad && rad !== c ? `${rad}${radHv ? ` ${radHv}` : ""}` : "",
    words: [...new Set([...sheet.map((w) => w.hanzi), ...(info?.words.map((w) => w.hanzi) ?? [])])].filter((h) => h !== c && h.includes(c)).slice(0, 4),
  };
}

/** Bố cục luyện viết của một chữ: dòng tô theo rồi dòng tự viết; ô đầu mỗi dòng là chữ mẫu. */
export interface PracticeRow {
  kind: "trace" | "blank";
}
export const practiceRows = (total: number, trace: number): PracticeRow[] =>
  Array.from({ length: total }, (_, i) => ({ kind: i < trace ? "trace" : "blank" }));

/** Chia mảng thành các hàng `size` phần tử (hàng thứ tự nét dài thì xuống dòng). */
export const chunk = <T,>(xs: T[], size: number): T[][] => Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => xs.slice(i * size, (i + 1) * size));

/** Số từ mỗi trang bảng từ (hàng cao ~14,5 mm) — nhiều hơn thì sang trang sau. */
export const VOCAB_ROWS = 13;

/** Số trang của vở: bảng từ (chia trang) + mỗi chữ một trang + trang trắng. */
export const sheetPageCount = (words: number, chars: number, blankPages: number) => Math.max(1, Math.ceil(words / VOCAB_ROWS)) + chars + blankPages;
