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

## Giai đoạn 0 (Pinyin)
Thứ tự gợi ý: thanh điệu → nguyên âm đơn → thanh mẫu nhóm môi/đầu lưỡi → nhóm cuống lưỡi → j q x → zh ch sh r / z c s →
vận mẫu kép & mũi → biến điệu → kiểm tra tổng. Bài tập chủ yếu là nghe-chọn.

## Đề thi thử
Mô phỏng cấu trúc phần (nghe/đọc/viết) và thời gian của cấp tương ứng, nhưng **câu hỏi tự soạn**; không sao chép đề thật.

## Kiểm tra trước khi xong
- [ ] Mọi `id` tham chiếu tồn tại (validate script kiểm tra)
- [ ] Không có từ ngoài phạm vi chưa chú thích
- [ ] Bài tập có đúng 1 đáp án; `order.answer` ghép được từ `tokens`
- [ ] `node scripts/validate-content.mjs` pass
