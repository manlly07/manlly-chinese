#!/usr/bin/env node
// Sinh src/content/hanzi/chars.json (cấu tạo chữ) cho mọi chữ có trong từ vựng, từ dictionary.txt của Make Me a Hanzi.
// Dùng: node scripts/build-chars.mjs <đường-dẫn-dictionary.txt>
// Tải dictionary.txt: https://github.com/skishore/makemeahanzi (LGPL-3.0 — ghi nguồn trong docs/DATA.md).
// Chạy lại sau khi thêm từ vựng cấp mới; sửa cấu tạo sai bằng OVERRIDES bên dưới, không sửa tay file JSON.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("Thiếu đường dẫn dictionary.txt — xem chú thích đầu file.");
  process.exit(1);
}

const HAN = /\p{Script=Han}/u;
const IDC = /[⿰-⿻]/u;

/**
 * Sửa cấu tạo của Make Me a Hanzi khi sai hoặc không hữu ích cho người học.
 * `parts: []` = dạy như chữ nguyên khối (tượng hình), không tách.
 */
const OVERRIDES = {
  气: { parts: [] },
  生: { parts: [] },
  不: { parts: [] },
  人: { parts: [] },
  中: { parts: [] },
  再: { parts: [] },
  么: { parts: ["丿", "厶"] },
  学: { parts: ["⺍", "冖", "子"] },
  坐: { parts: ["从", "土"] },
};

const dict = new Map();
for (const line of readFileSync(src, "utf8").split("\n")) {
  if (!line.trim()) continue;
  const o = JSON.parse(line);
  dict.set(o.character, o);
}

/** Cây IDS → các thành phần dạy được: giữ nút là một chữ, bung nút ghép không có tên. */
function parts(ids) {
  const chars = [...ids];
  let i = 0;
  const parse = () => {
    const c = chars[i++];
    if (c && IDC.test(c)) {
      const n = c === "⿲" || c === "⿳" ? 3 : 2;
      return { op: c, kids: Array.from({ length: n }, parse) };
    }
    return c;
  };
  const tree = parse();
  if (typeof tree === "string" || tree.op === "⿻") return [];
  const out = [];
  const walk = (t) => (typeof t === "string" ? out.push(t) : t.kids.forEach(walk));
  tree.kids.forEach(walk);
  return out.some((p) => !p || p === "？") ? [] : out;
}

// Chữ theo thứ tự xuất hiện trong từ vựng (cấp tăng dần)
const vocabDir = "src/content/vocab";
const files = readdirSync(vocabDir)
  .filter((f) => /^hsk-\d+\.json$/.test(f))
  .sort((a, b) => Number(/\d+/.exec(a)) - Number(/\d+/.exec(b)));
const order = [];
const seen = new Set();
for (const f of files) {
  for (const w of JSON.parse(readFileSync(join(vocabDir, f), "utf8")).words) {
    for (const c of w.hanzi) {
      if (!HAN.test(c) || seen.has(c)) continue;
      seen.add(c);
      order.push(c);
    }
  }
}

const out = [];
const missing = [];
for (const c of order) {
  const d = dict.get(c);
  if (!d) {
    missing.push(c);
    continue;
  }
  const ety = d.etymology ?? {};
  const entry = { char: c, radical: d.radical, parts: OVERRIDES[c]?.parts ?? parts(d.decomposition) };
  if (ety.type === "pictophonetic" && entry.parts.includes(ety.semantic) && entry.parts.includes(ety.phonetic)) {
    entry.semantic = ety.semantic;
    entry.phonetic = ety.phonetic;
  }
  out.push(entry);
}

const target = "src/content/hanzi/chars.json";
writeFileSync(target, "[\n" + out.map((e) => "  " + JSON.stringify(e)).join(",\n") + "\n]\n");
console.log(`Đã ghi ${out.length} chữ vào ${target}` + (missing.length ? ` · không có dữ liệu: ${missing.join(" ")}` : ""));
