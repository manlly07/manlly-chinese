#!/usr/bin/env node
// Tải âm thanh âm tiết (người thật đọc) cho mọi âm tiết trong src/content/syllables.json
// từ bộ dữ liệu mở audio-cmn (https://github.com/hugolpz/audio-cmn) — giọng Chen Wang, giấy phép CC BY-SA.
// Dùng: node scripts/fetch-syllable-audio.mjs [24k-abr|64k]   (mặc định 24k-abr ≈ 7 MB)
// Ghi file vào public/audio/syllables/<âm tiết, ü→v><thanh>.mp3 và danh sách thiếu vào src/content/syllable-audio.json.
// Chạy lại sau khi thêm âm tiết mới vào syllables.json. Không đổi tên/ghép nối file (giữ nguyên tác phẩm gốc).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const QUALITY = process.argv[2] ?? "24k-abr";
const BASE = `https://raw.githubusercontent.com/hugolpz/audio-cmn/master/${QUALITY}/syllabs`;
const OUT = "public/audio/syllables";
const { syllables } = JSON.parse(readFileSync("src/content/syllables.json", "utf8"));

mkdirSync(OUT, { recursive: true });
const jobs = syllables.flatMap((e) => [1, 2, 3, 4].map((t) => ({ key: `${e.s.replace("ü", "v")}${t}`, s: e.s, t })));
const missing = [];
let fetched = 0;

async function get({ key, s, t }) {
  const file = join(OUT, `${key}.mp3`);
  if (existsSync(file)) return;
  const res = await fetch(`${BASE}/cmn-${key}.mp3`);
  if (!res.ok) {
    missing.push(`${s}${t}`);
    return;
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  fetched++;
}

// tải song song vừa phải để không dồn máy chủ
for (let i = 0; i < jobs.length; i += 16) await Promise.all(jobs.slice(i, i + 16).map(get));

writeFileSync(
  "src/content/syllable-audio.json",
  JSON.stringify(
    {
      source: "audio-cmn (https://github.com/hugolpz/audio-cmn) — giọng Chen Wang, CC BY-SA",
      quality: QUALITY,
      missing: missing.sort(),
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(
  join(OUT, "LICENSE.txt"),
  [
    "Âm thanh âm tiết tiếng Trung trong thư mục này lấy nguyên bản từ dự án audio-cmn:",
    "  https://github.com/hugolpz/audio-cmn  (thư mục " + QUALITY + "/syllabs)",
    "Người đọc: Chen Wang. Giấy phép: Creative Commons Attribution-ShareAlike (CC BY-SA).",
    "Tên file được đổi từ cmn-<pinyin><thanh>.mp3 thành <pinyin><thanh>.mp3; nội dung âm thanh giữ nguyên.",
    "",
  ].join("\n"),
);
console.log(`Tải mới ${fetched} file · thiếu ${missing.length}${missing.length ? `: ${missing.join(" ")}` : ""}`);
