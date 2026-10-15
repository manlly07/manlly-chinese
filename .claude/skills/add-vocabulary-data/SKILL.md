---
name: add-vocabulary-data
description: Thêm, sửa hoặc mở rộng dữ liệu từ vựng / chữ Hán / bộ thủ trong src/content (HSK 1–6, HSK 3.0). Dùng khi được yêu cầu bổ sung từ, một cấp HSK mới, ví dụ câu, âm Hán Việt, chủ đề từ vựng, hoặc sửa lỗi dữ liệu.
---

# Thêm dữ liệu từ vựng

Đọc trước: `docs/DATA.md` (schema) và skill `chinese-content-conventions` (quy ước pinyin/Hán Việt).

## Quy trình
1. **Xác định file đích**: `src/content/vocab/hsk-<n>.json` theo cấp HSK 2.0 của từ. Chữ đơn → thêm cả vào `src/content/hanzi/chars.json` nếu chưa có.
2. **Kiểm tra trùng**: tìm `"hanzi": "<từ>"` trong toàn bộ `src/content/vocab/`. Từ đã có ở cấp khác → không thêm lại; chữ đa âm khác nghĩa → thêm với `id` khác pinyin.
3. **Soạn mục từ** đủ trường: `id`, `hanzi`, `pinyin`, `hanViet`, `meaning`, `pos`, `hsk2`, `hsk3`, `topics`, `examples` (≥ 1 câu, ưu tiên chỉ dùng từ cùng cấp hoặc thấp hơn).
   - `id` = `hanzi + "|" + pinyin bỏ dấu, bỏ cách, ü→v`: `"女儿|nver"`.
   - `hsk3`: chỉ điền khi chắc chắn; không chắc → `null`.
4. **Giữ thứ tự** trong file: theo thứ tự danh sách HSK chính thức nếu có, không thì theo pinyin.
5. **Không đổi `id` của từ đã có** — progress người dùng gắn vào `id`. Cần đổi → báo lại để viết migrate (skill `srs-and-progress`).
6. Chạy `node scripts/validate-content.mjs`; sửa hết lỗi.
7. Báo lại: số từ đã thêm, những trường để `null`/rỗng vì chưa chắc chắn.

## Khi thêm cả một cấp lớn
- Làm theo lô ~50 từ, validate sau mỗi lô.
- Không tự bịa cấp HSK: nếu không có danh sách chuẩn trong tay, hỏi người dùng nguồn danh sách hoặc ghi rõ là ước lượng.
- Ví dụ câu tự viết; không chép nguyên văn từ giáo trình/từ điển có bản quyền (xem `docs/DATA.md` §8).

## Chủ đề (`topics`) dùng chung
`greeting, family, number, time, date, food, drink, shopping, money, school, work, travel, transport,
place, direction, weather, body, health, hobby, sport, emotion, color, animal, home, clothes,
communication, nature, society, business, culture, abstract`
Thêm chủ đề mới → cập nhật danh sách này và `scripts/validate-content.mjs` (`TOPICS`).
