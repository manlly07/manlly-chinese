import type { Word } from "./content";
import { numberedToMarked, pinyinKey } from "./pinyin";

/** Bỏ dấu tiếng Việt, chữ thường: "Học tập" → "hoc tap". */
export function foldVi(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

const HAN = /\p{Script=Han}/u;

/**
 * Điểm khớp của từ với truy vấn (0 = không khớp; càng cao càng liên quan).
 * Hỗ trợ: Hán tự, pinyin có dấu / không dấu / số (ni3), nghĩa Việt và Hán Việt (có hoặc không dấu).
 */
export function matchWord(w: Word, query: string): number {
  const q = query.trim();
  if (!q) return 1;
  if (HAN.test(q)) return w.hanzi === q ? 100 : w.hanzi.includes(q) ? 50 : 0;

  let score = 0;
  const qKey = pinyinKey(/\d/.test(q) ? numberedToMarked(q) : q);
  const wKey = pinyinKey(w.pinyin);
  if (qKey && wKey === qKey) score = Math.max(score, 90);
  else if (qKey && wKey.startsWith(qKey)) score = Math.max(score, 60);

  const qMarked = q.toLowerCase();
  if (/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(qMarked) && w.pinyin.toLowerCase().replace(/\s/g, "").includes(qMarked.replace(/\s/g, "")))
    score = Math.max(score, 95);

  const fq = foldVi(q);
  const meanings = w.meaning.map(foldVi);
  if (meanings.some((m) => m === fq)) score = Math.max(score, 85);
  else if (meanings.some((m) => m.split(/[\s,;()]+/).includes(fq))) score = Math.max(score, 70);
  else if (fq.length >= 2 && meanings.some((m) => m.includes(fq))) score = Math.max(score, 40);

  const hv = foldVi(w.hanViet);
  if (hv && hv === fq) score = Math.max(score, 80);
  else if (hv && fq.length >= 2 && hv.includes(fq)) score = Math.max(score, 35);

  // ưu tiên nghĩa Việt có dấu khớp chính xác
  if (w.meaning.some((m) => m.toLowerCase() === q.toLowerCase())) score += 5;
  return score;
}

export function searchWords(words: Word[], query: string): Word[] {
  if (!query.trim()) return words;
  return words
    .map((w) => [w, matchWord(w, query)] as const)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);
}
