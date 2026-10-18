# Dữ liệu học (content)

Mọi dữ liệu học nằm trong `src/content/`, dạng JSON, lazy-load theo cấp.
Sau mỗi lần sửa: `node scripts/validate-content.mjs`.

## 1. Từ vựng — `src/content/vocab/hsk-<n>.json`

```jsonc
{
  "level": 1,                       // cấp HSK 2.0 (1–6) của file
  "words": [
    {
      "id": "学习|xuexi",           // hanzi|pinyin-không-dấu-liền
      "hanzi": "学习",
      "pinyin": "xué xí",            // dấu thanh, các âm tiết cách nhau 1 dấu cách
      "hanViet": "học tập",          // có thể rỗng nếu không có âm Hán Việt phù hợp
      "meaning": ["học", "học tập"], // nghĩa tiếng Việt, nghĩa phổ biến đứng đầu
      "pos": ["v"],                  // n, v, adj, adv, pron, num, mw, prep, conj, part, int, phr
      "hsk2": 1,                     // cấp HSK 2.0
      "hsk3": 1,                     // cấp HSK 3.0 (null nếu chưa xác minh)
      "topics": ["school"],
      "examples": [
        { "zh": "我在学习汉语。", "py": "Wǒ zài xuéxí Hànyǔ.", "vi": "Tôi đang học tiếng Trung." }
      ]
    }
  ]
}
```

## 2. Cấu tạo chữ — `src/content/hanzi/chars.json` (sinh tự động) + `components.json`

```jsonc
// chars.json — KHÔNG sửa tay: node scripts/build-chars.mjs <dictionary.txt của Make Me a Hanzi>
{ "char": "吗", "radical": "口", "parts": ["口", "马"], "semantic": "口", "phonetic": "马" }
// parts: [] = chữ nguyên khối (tượng hình), dạy như một bộ. Sửa cấu tạo sai bằng OVERRIDES trong script.

// components.json — Hán Việt + nghĩa cho bộ/thành phần (soạn tay)
{ "c": "亻", "hanViet": "nhân", "meaning": "người", "note": "Nhân đứng — dạng của 人 khi đứng bên trái: 你, 他, 们." }
```
Thông tin thành phần lấy theo thứ tự ưu tiên: `components.json` → `radicals.json` → từ một chữ trong từ vựng.
Pinyin, Hán Việt của chữ vẫn suy ra từ từ vựng (`buildCharIndex`). Thứ tự nét lấy từ `hanzi-writer` lúc chạy.

## 3. Bộ thủ — `src/content/hanzi/radicals.json`

`{ "radical": "氵", "variantOf": "水", "hanViet": "thủy", "meaning": "nước", "strokes": 3, "examples": ["河","海","洗"] }`

## 4. Ngữ pháp — `src/content/grammar/hsk-<n>.json`

```jsonc
{ "id": "g-hsk1-shi", "level": 1, "title": "Câu chữ 是",
  "pattern": "A 是 B",
  "explain": "Dùng để nối hai danh từ: A là B. Phủ định: A 不是 B.",
  "vnPitfalls": ["Không dùng 是 trước tính từ: ❌ 我是忙 → ✅ 我很忙"],
  "examples": [{ "zh": "我是学生。", "py": "Wǒ shì xuésheng.", "vi": "Tôi là học sinh." }],
  "exercises": [{ "type": "order", "tokens": ["是","我","老师"], "answer": "我是老师" }] }
```
Loại bài tập (ngữ pháp):
- `order`: `{ tokens, answer, vi? }` — `answer` ghép được từ `tokens` (so khớp bỏ dấu câu).
- `fill`: `{ text, options, answer, vi? }` — `text` chứa đúng một chỗ trống `＿` (U+FF3F).
- `choose`: `{ prompt, options, answer }`.
- `translate`: dự phòng, UI chưa chấm.

## 5. Bài học — `src/content/lessons/<level>.json`

```jsonc
{ "id": "hsk1-03", "level": 1, "title": "Hỏi tên", "goals": ["Hỏi và nói tên"],
  "words": ["叫|jiao", "名字|mingzi", "什么|shenme"],
  "grammar": ["g-hsk1-shenme"],
  "dialogue": "d-hsk1-03",
  "exercises": [ /* tuỳ chọn — như mục 4 + "listen-choose", "tone" */ ] }
```
- File: `{ "level": 1, "lessons": [...] }`, thứ tự trong mảng = thứ tự lộ trình.
- Bài tập của bài học **sinh tự động khi chạy** (`lib/exercises.ts#buildLessonExercises`): mỗi từ mới 1 câu
  (nghe→Hán / Hán→nghĩa / chọn thanh / nghĩa→Hán) + toàn bộ bài tập của các điểm ngữ pháp trong bài.
  Bài ôn tập (`words: []`) lấy mẫu 10 từ đã học cùng cấp. Trường `exercises` trong file chỉ dùng khi cần câu soạn riêng.
- **i+1**: `validate-content.mjs` cảnh báo nếu câu hội thoại có chữ chưa học tới bài đó (tính theo chữ của các từ
  trong `words` các bài trước + bài hiện tại). Tên riêng cho phép: `NAMES` trong script (王 李 兰 明 越南 河内).
  Cố ý vượt phạm vi → thêm `"note"` vào dòng đó.

## 6. Hội thoại & bài đọc — `dialogues/`, `readings/`

```jsonc
{ "id": "d-hsk1-03", "level": 1, "title": "Gặp bạn mới",
  "lines": [{ "speaker": "Minh", "zh": "你叫什么名字？", "py": "Nǐ jiào shénme míngzi?", "vi": "Bạn tên là gì?" }] }
```
`speaker` là tên hiển thị tiếng Việt (Lan, Minh, Thầy Vương…); mỗi người nói được đọc với cao độ giọng khác nhau.
File hội thoại là mảng `[...]` theo cấp: `dialogues/hsk-<n>.json`. Bài đọc thêm `questions: [{ q, options, answer }]`.

## 6b. Bộ thủ — `src/content/hanzi/radicals.json`
Mảng theo mục 3; `examples` chỉ dùng chữ có trong từ vựng (để link sang trang chữ). Chưa có `chars.json`:
thông tin chữ (pinyin, Hán Việt, từ chứa chữ) suy ra từ từ vựng (`lib/content.ts#buildCharIndex`).

## 7. Pinyin — `src/content/pinyin.json`

Danh sách thanh mẫu/vận mẫu, ví dụ (chữ + pinyin), mẹo so sánh tiếng Việt, và các nhóm luyện thanh (妈麻马骂…).

## 7a. Nét cơ bản — `src/content/hanzi/strokes.json`
`{ strokes: [{ glyph, name, pinyin, vi, desc, example }], rules: [{ title, example, explain }], exercises: [ChooseExercise] }` —
dùng cho bài `nt-01` (`"strokes": true`). Chữ `example` của quy tắc phải có trong từ vựng (nút Tập viết mở trang chữ).
Câu hỏi khoá sổ lỗi theo chỉ số (`s:#i`) — thêm câu mới vào **cuối** mảng, không chèn giữa.

## 7b. Bảng âm tiết — `src/content/syllables.json`

`{ "s": "cha", "i": "ch", "f": "a", "t": ["插", "茶", "", "岔"] }` — `i` phụ âm đầu ("" nếu không có), `f` vần (tên trong
`pinyin.json`; ju = j + ü, you = "" + iu), `t` chữ đại diện thanh 1–4 để TTS đọc ("" = không có chữ thông dụng).
`s` phải bằng `spell(i, f)` (quy tắc viết: j q x + ü → u, i → y, u → w, ü → yu, iou/uei/uen → iu/ui/un).
Chọn chữ thông dụng, **tránh chữ đa âm** (行, 长, 了…) — giọng máy đọc chữ một mình theo âm phổ biến nhất.

## 7c. Bài Nhập môn pinyin — `src/content/lessons/hsk-0.json`
Bài level 0, `words/grammar` rỗng, thêm trường `pinyin` (xem skill `write-lesson-content`). Validate kiểm tra mảnh có trong
`pinyin.json`, âm tiết `demo` chỉ dùng mảnh đã học tới bài đó, và mọi ví dụ quy tắc viết khớp `spell`.

## 8. Nguồn & giấy phép (BẮT BUỘC ghi nhận trong trang "Giới thiệu")

| Nguồn | Dùng cho | Giấy phép / lưu ý |
|---|---|---|
| CC-CEDICT | pinyin, nghĩa tham khảo (tiếng Anh) | CC BY-SA 4.0 — phải ghi nguồn, chia sẻ tương tự với phần dẫn xuất |
| Make Me a Hanzi / hanzi-writer-data | thứ tự nét | Arphic Public License (dữ liệu nét) — ghi nguồn |
| Make Me a Hanzi `dictionary.txt` | cấu tạo chữ, phần gợi nghĩa/gợi âm (`hanzi/chars.json`) | **LGPL-3.0** (dẫn xuất từ Unihan, CJKlib) — ghi nguồn; `chars.json` là phần dẫn xuất, phân phối theo LGPL |
| Danh sách từ HSK | phân cấp từ | Danh sách công bố công khai; kiểm tra lại cấp khi đối chiếu |
| Nghĩa tiếng Việt, Hán Việt, ví dụ | tự biên soạn | Không sao chép nguyên văn từ điển/giáo trình có bản quyền |

Không chép nguyên bài khoá, hội thoại từ giáo trình thương mại (vd. giáo trình Hán ngữ, HSK Standard Course) — tự viết nội dung tương đương.
