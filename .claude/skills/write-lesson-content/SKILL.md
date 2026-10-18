---
name: write-lesson-content
description: Soạn nội dung bài học, điểm ngữ pháp, hội thoại, bài đọc và bài tập cho lộ trình từ nhập môn đến cao cấp. Dùng khi được yêu cầu viết bài học mới, thêm ngữ pháp, hội thoại tình huống, bài đọc hiểu hoặc đề luyện/đề thi thử.
---

# Soạn nội dung bài học

Đọc trước: `docs/PRODUCT.md` §2 (lộ trình), `docs/DATA.md` §4–6 (schema), skill `chinese-content-conventions`.

## Nguyên tắc sư phạm
- **i+1**: mỗi bài chỉ ~6–12 từ mới (sơ cấp) / 12–20 (trung–cao cấp) và 1–2 điểm ngữ pháp mới.
- Hội thoại/bài đọc chỉ dùng từ **đã học ở bài trước + từ mới của bài**. Ngoại lệ → chú thích ngay trong `lines`.
- Giải thích ngữ pháp bằng tiếng Việt, so sánh với cấu trúc tiếng Việt; luôn có `vnPitfalls` (lỗi người Việt hay mắc):
  trật tự trạng ngữ thời gian/nơi chốn đứng trước động từ, dùng 是 trước tính từ, định ngữ đứng trước danh từ (我的书),
  lạm dụng 了, nhầm 的/得/地, vị trí bổ ngữ.
- Tình huống thực tế với người Việt: đi Trung Quốc du lịch, làm việc với đối tác, học tập, mua sắm online…

## Cấu trúc một bài (`src/content/lessons/<level>.json`)
1. `goals` (2–3 mục tiêu "có thể làm được").
2. `words` — id từ đã tồn tại trong `vocab/` (thiếu → thêm theo skill `add-vocabulary-data` trước).
3. `grammar` — id điểm ngữ pháp trong `grammar/`.
4. `dialogue` — id trong `dialogues/`; 6–12 câu sơ cấp, dài hơn ở cấp cao.
5. `exercises` — 8–15 bài, trộn dạng: `listen-choose`, `tone`, `order`, `fill`, `choose`, `translate`. Mỗi bài có đáp án duy nhất rõ ràng.

## Cách soạn trong repo này
- Bài tập từ vựng của bài học được **sinh tự động** — chỉ cần soạn `words`, `grammar`, `dialogue`; bài tập ngữ pháp nằm trong `grammar/`.
- Chạy `node scripts/validate-content.mjs`: script cảnh báo chữ chưa học trong hội thoại (i+1). Sửa bằng cách đổi câu,
  chuyển từ sang bài sớm hơn, hoặc thêm `"note"` vào dòng nếu cố ý. Tên riêng mới → thêm vào `NAMES` trong script.
- Thêm/đổi thứ tự bài: giữ `id` cũ (tiến độ gắn vào `id`); bài mới thêm số tiếp theo, không đánh số lại.

## Giai đoạn 0 (Pinyin) — `lessons/hsk-0.json`, level 0, id `py-NN`
Nguyên tắc: **học từng mảnh rồi tự ghép** (ch + a = cha → tự đọc được chi, chu…), không học thuộc từng âm tiết.
Mỗi bài có trường `pinyin`: `initials`/`finals` (mảnh MỚI của bài, phải có trong `pinyin.json`), `demo` (âm tiết trình diễn —
bài tập cố ý hỏi âm tiết ngoài `demo` để luyện tự ghép), `rules` (quy tắc viết; mỗi ví dụ `{ parts, answer, wrong }` thành 1 câu hỏi),
cờ `tones` / `zero` (y, w) / `review` / `sandhi`. Bài tập sinh tự động (`lib/pinyin-drill.ts`) từ `syllables.json`.
Âm tiết mới → thêm vào `src/content/syllables.json` kèm chữ đại diện cho từng thanh (chữ thông dụng, tránh chữ đa âm — TTS đọc chữ đó).
Nhập môn không có kiểm tra chặng; "Kiểm tra nhanh pinyin" (`/test/pinyin`) cho người đã biết bỏ qua (xếp lớp tới bài cấp 0 cuối).
Bài cuối Chặng 0 là `nt-01` "Nét cơ bản & thứ tự viết" (`"strokes": true`, nội dung `hanzi/strokes.json`) — cầu nối sang bước "Bộ mới".

## Bộ thủ trong bài HSK
Bước "Bộ mới" tự tính (`lib/hanzi-parts.ts#partsByLesson`): bộ xuất hiện lần đầu trong chữ của bài, tối đa 6, ưu tiên bộ dùng lại nhiều.
Không cần soạn tay — chỉ cần `chars.json` + `components.json` đủ dữ liệu.

## Đề thi thử
Mô phỏng cấu trúc phần (nghe/đọc/viết) và thời gian của cấp tương ứng, nhưng **câu hỏi tự soạn**; không sao chép đề thật.

## Kiểm tra trước khi xong
- [ ] Mọi `id` tham chiếu tồn tại (validate script kiểm tra)
- [ ] Không có từ ngoài phạm vi chưa chú thích
- [ ] Bài tập có đúng 1 đáp án; `order.answer` ghép được từ `tokens`
- [ ] `node scripts/validate-content.mjs` pass
