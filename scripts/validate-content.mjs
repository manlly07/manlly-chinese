#!/usr/bin/env node
// Kiểm tra dữ liệu học trong src/content (hoặc thư mục truyền vào làm đối số).
// Dùng: node scripts/validate-content.mjs [đường-dẫn-content]
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(process.argv[2] ?? "src/content");
const TOPICS = new Set(
  ("greeting family number time date food drink shopping money school work travel transport place direction " +
    "weather body health hobby sport emotion color animal home clothes communication nature society business culture abstract")
    .split(" "),
);
const POS = new Set(["n", "v", "adj", "adv", "pron", "num", "mw", "prep", "conj", "part", "int", "phr"]);
const EXERCISE_TYPES = new Set(["order", "fill", "choose", "translate", "listen-choose", "tone"]);
const HAN = /\p{Script=Han}/u;

const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${relative(process.cwd(), f)}: ${m}`);
const warn = (f, m) => warnings.push(`${relative(process.cwd(), f)}: ${m}`);

/** Bỏ dấu thanh, ü→v, bỏ cách và dấu ' ; chữ thường */
export function pinyinKey(py) {
  return py
    .replace(/[üǖǘǚǜÜǕǗǙǛ]/g, "v")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s']/g, "")
    .toLowerCase();
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    err(file, `JSON không hợp lệ — ${e.message}`);
    return null;
  }
}

function jsonFiles(dir) {
  const d = join(ROOT, dir);
  if (!existsSync(d) || !statSync(d).isDirectory()) return [];
  return readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => join(d, f));
}

function checkExample(file, where, ex) {
  for (const k of ["zh", "py", "vi"]) if (!ex?.[k]?.trim()) err(file, `${where}: ví dụ thiếu "${k}"`);
  if (ex?.py && /\d/.test(ex.py)) err(file, `${where}: pinyin ví dụ chứa số — dùng dấu thanh`);
  if (ex?.zh && /[,?!:;]/.test(ex.zh)) warn(file, `${where}: câu Trung dùng dấu câu Latin, nên dùng ，？！：；`);
}

function checkExercise(file, where, ex) {
  if (!EXERCISE_TYPES.has(ex?.type)) return err(file, `${where}: loại bài tập không hợp lệ "${ex?.type}"`);
  if (ex.type === "order") {
    const joined = [...(ex.tokens ?? [])].sort().join("");
    const ans = [...(ex.answer ?? "")];
    const tokChars = [...(ex.tokens ?? []).join("")].sort().join("");
    if (tokChars !== ans.sort().join("")) err(file, `${where}: "answer" không ghép được từ "tokens"`);
    if (!joined) err(file, `${where}: thiếu tokens`);
  }
  if ((ex.type === "fill" || ex.type === "choose") && !(ex.options ?? []).includes(ex.answer))
    err(file, `${where}: "answer" không nằm trong "options"`);
  if (ex.type === "fill" && !ex.text?.includes("＿")) err(file, `${where}: "fill" cần "text" có chỗ trống ＿`);
  if (ex.type === "choose" && !ex.prompt?.trim()) err(file, `${where}: "choose" cần "prompt"`);
}

// ---------- Từ vựng ----------
const wordIds = new Map(); // id -> file
const wordChars = new Map(); // id -> chữ Hán của từ
for (const file of jsonFiles("vocab")) {
  const data = readJson(file);
  if (!data) continue;
  if (!Number.isInteger(data.level)) err(file, `thiếu "level" số nguyên`);
  if (!Array.isArray(data.words)) {
    err(file, `thiếu mảng "words"`);
    continue;
  }
  data.words.forEach((w, i) => {
    const at = `words[${i}] ${w?.hanzi ?? "?"}`;
    if (!w?.hanzi || !HAN.test(w.hanzi)) return err(file, `${at}: "hanzi" rỗng hoặc không phải chữ Hán`);
    if (!w.pinyin?.trim()) return err(file, `${at}: thiếu "pinyin"`);
    if (/\d/.test(w.pinyin)) err(file, `${at}: pinyin chứa số — dùng dấu thanh`);

    const expectedId = `${w.hanzi}|${pinyinKey(w.pinyin)}`;
    if (w.id !== expectedId) err(file, `${at}: id "${w.id}" phải là "${expectedId}"`);
    if (wordIds.has(w.id)) err(file, `${at}: trùng id với ${relative(process.cwd(), wordIds.get(w.id))}`);
    wordIds.set(w.id, file);
    wordChars.set(w.id, [...w.hanzi].filter((c) => HAN.test(c)));

    const chars = [...w.hanzi].filter((c) => HAN.test(c));
    const syl = w.pinyin.trim().split(/\s+/);
    const erhua = chars.at(-1) === "儿" && /r$/.test(syl.at(-1) ?? "") && syl.at(-1) !== "ér";
    const expectedSyl = chars.length - (erhua ? 1 : 0);
    if (syl.length !== expectedSyl)
      err(file, `${at}: ${syl.length} âm tiết pinyin nhưng ${expectedSyl} chữ (âm tiết cách nhau bằng dấu cách)`);

    if (w.hanViet && w.hanViet.trim().split(/\s+/).length !== chars.length)
      warn(file, `${at}: số âm Hán Việt khác số chữ ("${w.hanViet}")`);
    if (!Array.isArray(w.meaning) || !w.meaning.length || w.meaning.some((m) => !m?.trim()))
      err(file, `${at}: "meaning" phải là mảng nghĩa không rỗng`);
    for (const p of w.pos ?? []) if (!POS.has(p)) err(file, `${at}: pos không hợp lệ "${p}"`);
    if (!w.pos?.length) warn(file, `${at}: chưa có "pos"`);
    if (data.level && w.hsk2 !== data.level) err(file, `${at}: hsk2=${w.hsk2} khác level file ${data.level}`);
    if (w.hsk3 != null && !(Number.isInteger(w.hsk3) && w.hsk3 >= 1 && w.hsk3 <= 9)) err(file, `${at}: hsk3 phải 1–9 hoặc null`);
    for (const t of w.topics ?? []) if (!TOPICS.has(t)) err(file, `${at}: chủ đề lạ "${t}" (thêm vào TOPICS nếu cố ý)`);
    if (!w.examples?.length) warn(file, `${at}: chưa có câu ví dụ`);
    (w.examples ?? []).forEach((ex, j) => checkExample(file, `${at} examples[${j}]`, ex));
  });
}

// ---------- Ngữ pháp ----------
const grammarIds = new Set();
for (const file of jsonFiles("grammar")) {
  const data = readJson(file);
  if (!data) continue;
  const items = Array.isArray(data) ? data : data.items ?? [];
  items.forEach((g, i) => {
    const at = `[${i}] ${g?.id ?? "?"}`;
    if (!g?.id?.startsWith("g-")) err(file, `${at}: id phải bắt đầu "g-"`);
    if (grammarIds.has(g.id)) err(file, `${at}: trùng id`);
    grammarIds.add(g.id);
    for (const k of ["title", "pattern", "explain"]) if (!g[k]?.trim()) err(file, `${at}: thiếu "${k}"`);
    if (!g.vnPitfalls?.length) warn(file, `${at}: chưa có "vnPitfalls"`);
    (g.examples ?? []).forEach((ex, j) => checkExample(file, `${at} examples[${j}]`, ex));
    (g.exercises ?? []).forEach((ex, j) => checkExercise(file, `${at} exercises[${j}]`, ex));
  });
}

// ---------- Hội thoại & bài đọc ----------
const dialogueIds = new Set();
const dialogueLines = new Map(); // id -> { file, lines }
for (const dir of ["dialogues", "readings"]) {
  for (const file of jsonFiles(dir)) {
    const data = readJson(file);
    if (!data) continue;
    const items = Array.isArray(data) ? data : [data];
    items.forEach((d, i) => {
      const at = `[${i}] ${d?.id ?? "?"}`;
      if (!d?.id) return err(file, `${at}: thiếu id`);
      if (dialogueIds.has(d.id)) err(file, `${at}: trùng id`);
      dialogueIds.add(d.id);
      dialogueLines.set(d.id, { file, lines: d.lines ?? [] });
      (d.lines ?? []).forEach((l, j) => checkExample(file, `${at} lines[${j}]`, l));
      (d.questions ?? []).forEach((q, j) => {
        if (!(q.options ?? []).includes(q.answer)) err(file, `${at} questions[${j}]: answer không nằm trong options`);
      });
    });
  }
}

// ---------- Bài học ----------
const lessonIds = new Set();
for (const file of jsonFiles("lessons")) {
  const data = readJson(file);
  if (!data) continue;
  const items = Array.isArray(data) ? data : data.lessons ?? [];
  items.forEach((l, i) => {
    const at = `[${i}] ${l?.id ?? "?"}`;
    if (!/^[a-z0-9]+-\d{2}$/.test(l?.id ?? "")) err(file, `${at}: id dạng "<level>-<2 số>", vd "hsk1-03"`);
    if (lessonIds.has(l.id)) err(file, `${at}: trùng id`);
    lessonIds.add(l.id);
    for (const w of l.words ?? []) if (!wordIds.has(w)) err(file, `${at}: từ "${w}" chưa có trong vocab/`);
    for (const g of l.grammar ?? []) if (!grammarIds.has(g)) err(file, `${at}: ngữ pháp "${g}" chưa có`);
    if (l.dialogue && !dialogueIds.has(l.dialogue)) err(file, `${at}: hội thoại "${l.dialogue}" chưa có`);
    (l.exercises ?? []).forEach((ex, j) => checkExercise(file, `${at} exercises[${j}]`, ex));
  });
}

// ---------- i+1: hội thoại chỉ dùng chữ đã học ----------
// Tên riêng / địa danh dùng trong hội thoại sơ cấp (không thuộc từ vựng HSK).
const NAMES = new Set([..."王李兰明越南河内"]);
const known = new Set(NAMES);
const lessonFiles = jsonFiles("lessons").sort((a, b) => Number(/(\d+)\.json$/.exec(a)?.[1]) - Number(/(\d+)\.json$/.exec(b)?.[1]));
for (const file of lessonFiles) {
  const data = readJson(file);
  const items = Array.isArray(data) ? data : data?.lessons ?? [];
  for (const l of items) {
    for (const w of l.words ?? []) for (const c of wordChars.get(w) ?? []) known.add(c);
    const d = l.dialogue && dialogueLines.get(l.dialogue);
    if (!d) continue;
    d.lines.forEach((line, j) => {
      if (line.note) return; // ngoại lệ đã chú thích
      const unknown = [...new Set([...(line.zh ?? "")].filter((c) => HAN.test(c) && !known.has(c)))];
      if (unknown.length) warn(d.file, `${l.dialogue} lines[${j}]: chữ chưa học tới ${l.id}: ${unknown.join(" ")} (thêm "note" nếu cố ý)`);
    });
  }
}

// ---------- Kết quả ----------
if (!existsSync(ROOT)) console.log(`(Chưa có thư mục ${relative(process.cwd(), ROOT) || ROOT} — bỏ qua)`);
for (const w of warnings) console.warn(`⚠  ${w}`);
for (const e of errors) console.error(`✖  ${e}`);
console.log(
  `\nTừ: ${wordIds.size} · Ngữ pháp: ${grammarIds.size} · Hội thoại/đọc: ${dialogueIds.size} · Bài học: ${lessonIds.size}` +
    `\n${errors.length} lỗi, ${warnings.length} cảnh báo`,
);
process.exit(errors.length ? 1 : 0);
