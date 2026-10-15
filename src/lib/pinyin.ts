/** Thanh: 1–4, 5 = thanh nhẹ */
export type Tone = 1 | 2 | 3 | 4 | 5;

const TONE_MARKS: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

/** ký tự có dấu → [nguyên âm gốc, thanh] */
const MARKED = new Map<string, [string, Tone]>();
for (const [base, marks] of Object.entries(TONE_MARKS)) {
  marks.forEach((m, i) => {
    MARKED.set(m, [base, (i + 1) as Tone]);
    MARKED.set(m.toUpperCase(), [base.toUpperCase(), (i + 1) as Tone]);
  });
}

/** Thanh của một âm tiết có dấu ("hǎo" → 3, "ma" → 5). */
export function toneOf(syllable: string): Tone {
  for (const ch of syllable.normalize("NFC")) {
    const hit = MARKED.get(ch);
    if (hit) return hit[1];
  }
  return 5;
}

/** Bỏ dấu thanh, giữ ü ("lǜ" → "lü"). */
export function stripTone(s: string): string {
  return [...s.normalize("NFC")].map((ch) => MARKED.get(ch)?.[0] ?? ch).join("");
}

/** Khoá so khớp/ID: bỏ dấu, ü→v, bỏ cách và ', chữ thường. Khớp scripts/validate-content.mjs. */
export function pinyinKey(s: string): string {
  return stripTone(s)
    .replace(/[üÜ]/g, "v")
    .replace(/[\s']/g, "")
    .toLowerCase();
}

/** Chọn nguyên âm nhận dấu: a/e trước; "ou" → o; còn lại nguyên âm cuối. */
function markIndex(s: string): number {
  const lower = s.toLowerCase();
  for (const v of ["a", "e"]) {
    const i = lower.indexOf(v);
    if (i >= 0) return i;
  }
  const ou = lower.indexOf("ou");
  if (ou >= 0) return ou;
  for (let i = lower.length - 1; i >= 0; i--) if ("iouü".includes(lower[i])) return i;
  return -1;
}

/** Thêm dấu thanh cho âm tiết không dấu ("hao", 3 → "hǎo"). Chấp nhận v/u: thay cho ü. */
export function addTone(syllable: string, tone: Tone): string {
  const s = syllable.replace(/u:|v/g, "ü").replace(/U:|V/g, "Ü");
  if (tone === 5) return s;
  const i = markIndex(s);
  if (i < 0) return s;
  const ch = s[i];
  const marks = TONE_MARKS[ch.toLowerCase()];
  if (!marks) return s;
  const marked = ch === ch.toUpperCase() ? marks[tone - 1].toUpperCase() : marks[tone - 1];
  return s.slice(0, i) + marked + s.slice(i + 1);
}

/** "ni3 hao3" / "nv3" → "nǐ hǎo" / "nǚ". Số 5 hoặc 0 = thanh nhẹ. */
export function numberedToMarked(text: string): string {
  return text.replace(/([a-zA-ZüÜ:]+)([0-5])/g, (_, syl: string, n: string) =>
    addTone(syl, (n === "0" ? 5 : Number(n)) as Tone),
  );
}

/** "nǐ hǎo" → "ni3 hao3" (thanh nhẹ ghi 5). */
export function markedToNumbered(text: string): string {
  return splitSyllables(text)
    .map((s) => {
      const t = toneOf(s);
      return stripTone(s).replace(/ü/g, "v") + t;
    })
    .join(" ");
}

// ---------- Tách âm tiết ----------
const INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s", "y", "w"];
const FINALS = [
  "iang", "iong", "uang", "ueng", "ang", "eng", "ing", "ong", "ian", "iao", "uai", "uan", "üan", "van",
  "ai", "ei", "ao", "ou", "an", "en", "er", "in", "un", "ün", "vn", "ia", "ie", "iu", "ua", "uo", "ue", "üe", "ve", "ui",
  "a", "o", "e", "i", "u", "ü", "v", "ê",
];

/** Tách một chuỗi pinyin liền ("xuéxí", "Xī'ān") thành các âm tiết. Giữ nguyên dấu thanh và hoa/thường. */
export function splitSyllables(text: string): string[] {
  const out: string[] = [];
  for (const word of text.normalize("NFC").split(/[\s'’-]+/).filter(Boolean)) {
    const plain = stripTone(word).toLowerCase();
    let i = 0;
    while (i < word.length) {
      const len = matchSyllable(plain, i);
      if (len === 0) {
        // không nhận dạng được (dấu câu, số…) — gộp vào âm tiết trước hoặc đứng riêng
        out.push(word[i]);
        i++;
        continue;
      }
      out.push(word.slice(i, i + len));
      i += len;
    }
  }
  return out;
}

function matchSyllable(s: string, start: number): number {
  let best = 0;
  for (const ini of ["", ...INITIALS]) {
    if (ini && !s.startsWith(ini, start)) continue;
    for (const fin of FINALS) {
      const end = start + ini.length + fin.length;
      if (!s.startsWith(fin, start + ini.length)) continue;
      let len = ini.length + fin.length;
      // "r" cuối (儿化) khi không theo sau bởi nguyên âm
      if (s[end] === "r" && !/[aeiouüv]/.test(s[end + 1] ?? "")) len++;
      // Phụ âm cuối n/g có thể là đầu âm tiết sau ("xian" vs "xi'an" đã tách bằng '): nhường nếu phần sau không tách được
      if (len > best && (end >= s.length || canStartSyllable(s, start + len))) best = len;
    }
  }
  return best;
}

function canStartSyllable(s: string, i: number): boolean {
  if (i >= s.length) return true;
  return /[a-zü]/.test(s[i]) && INITIALS.concat(["a", "o", "e"]).some((p) => s.startsWith(p, i));
}

// ---------- Biến điệu ----------
/**
 * Thanh đọc thực tế cho dãy âm tiết của MỘT từ/cụm (dữ liệu ghi thanh gốc).
 * Quy tắc: 3+3 → 2+3; 不 + thanh 4 → bú; 一 + thanh 4 → yí, + thanh 1/2/3 → yì (cuối từ giữ yī).
 * `chars` (nếu có) giúp nhận diện 一/不 chính xác hơn.
 */
export function sandhiTones(syllables: string[], chars?: string[]): Tone[] {
  const tones = syllables.map(toneOf);
  const base = syllables.map((s) => stripTone(s).toLowerCase());
  const result = [...tones];
  for (let i = 0; i < tones.length - 1; i++) {
    const next = tones[i + 1];
    const isYi = chars ? chars[i] === "一" : base[i] === "yi" && tones[i] === 1;
    const isBu = chars ? chars[i] === "不" : base[i] === "bu" && tones[i] === 4;
    if (isYi) result[i] = next === 4 ? 2 : next === 5 ? 2 : 4;
    else if (isBu && next === 4) result[i] = 2;
  }
  // 3-3: xét từ phải sang trái để chuỗi 3-3-3 → 2-2-3
  for (let i = tones.length - 2; i >= 0; i--) {
    if (tones[i] === 3 && tones[i + 1] === 3) result[i] = 2;
  }
  return result;
}

/** Âm tiết với thanh đọc thực tế ("nǐ hǎo" → ["ní", "hǎo"]). */
export function sandhiSyllables(syllables: string[], chars?: string[]): string[] {
  const tones = sandhiTones(syllables, chars);
  return syllables.map((s, i) => (tones[i] === toneOf(s) ? s : addTone(stripTone(s), tones[i])));
}

/** Class màu Tailwind cho thanh (token tone-1..5). */
export const TONE_CLASS: Record<Tone, string> = {
  1: "text-tone-1",
  2: "text-tone-2",
  3: "text-tone-3",
  4: "text-tone-4",
  5: "text-tone-5",
};

export const TONE_NAMES: Record<Tone, string> = {
  1: "Thanh 1 (ngang)",
  2: "Thanh 2 (lên)",
  3: "Thanh 3 (xuống-lên)",
  4: "Thanh 4 (xuống)",
  5: "Thanh nhẹ",
};
