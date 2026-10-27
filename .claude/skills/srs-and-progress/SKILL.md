---
name: srs-and-progress
description: Logic ôn tập ngắt quãng (SRS), XP, streak, huy hiệu, lịch sử học và lưu/xuất/nhập/migrate dữ liệu tiến độ trong localStorage. Dùng khi sửa thuật toán ôn tập, cách tính điểm, store progress/settings, thay đổi schema dữ liệu người dùng, hoặc chức năng sao lưu/khôi phục.
---

# SRS & tiến độ

Đọc trước: `docs/ARCHITECTURE.md` §3–5.

## Nguyên tắc
- Hàm nghiệp vụ **thuần** trong `src/lib/` (`srs.ts`, `streak.ts`, `xp.ts`), nhận `now` làm tham số để test được.
- Store (`src/store/progress.ts`) chỉ gọi các hàm đó; component không tự tính khoảng ôn.
- Ngày = **giờ địa phương** `YYYY-MM-DD` (`lib/date.ts#dateKey`), không dùng `toISOString()` (lệch UTC).

## Thuật toán SRS (SM-2 rút gọn, 4 mức)
```
CardState { ease=2.5, interval(ngày)=0, reps=0, lapses=0, due(ms), lastReview?, updatedAt }
grade: 0 Quên | 1 Khó | 2 Được | 3 Dễ

Quên: reps=0, lapses+1, ease=max(1.3, ease-0.2), due = now + 10 phút (học lại trong phiên)
Còn lại:
  reps==0: interval = Khó 1 | Được 1 | Dễ 3
  reps==1: interval = Khó 3 | Được 6 | Dễ 8
  reps>=2: interval = round(interval × (Khó 1.2 | Được ease | Dễ ease×1.3)), tối thiểu interval+1
  ease += Khó -0.15 | Được 0 | Dễ +0.15  (min 1.3)
  reps+1, due = now + interval ngày
```
- Hiển thị khoảng ôn dự kiến trên nút (`10 phút`, `1 ngày`, `2 tháng`) — dùng chung hàm `schedule` để xem trước.
- Trạng thái thẻ: mới (chưa có CardState) · đang học (interval < 21) · thuộc (interval ≥ 21).
- Muốn chuyển sang FSRS: thêm trường, giữ hàm `schedule(card, grade, now)` cùng chữ ký, migrate thẻ cũ.

## XP & streak
| Hành động | XP |
|---|---|
| Ôn thẻ: Quên / còn lại | 1 / 2 |
| Học từ mới | 3 |
| Câu quiz đúng | 5 |
| Hoàn thành bài học | 20 (+10 nếu ≥ 90%) |
| Kiểm tra chặng / tuần (chỉ khi đạt 80%) | 30 (+20 nếu ≥ 90%) |
| Ôn tổng hợp hằng ngày (ghi `tests["daily-YYYY-MM-DD"]`, ngưỡng 50%) | 30 (+20 nếu ≥ 90%) |
- Ngày "hoạt động" = `history[day].xp > 0`. Streak = số ngày hoạt động liên tiếp tính tới hôm nay (hoặc hôm qua nếu hôm nay chưa học).
- Đóng băng streak: tối đa 1 ngày/tuần ISO, tự áp dụng khi lỡ đúng 1 ngày.

## Ôn tập thường xuyên & kiểm tra (kiểu Duolingo) — `lib/review-mix.ts`
- **Sổ lỗi sai** `mistakes`: khoá `w:<wordId>` · `g:<grammarId>#<i>` · `l:<dialogueId>#<i>`. `ExerciseRunner` tự `logMistake` khi sai,
  `resolveMistake` (giảm đếm, về 0 thì xoá) khi đúng — ở bất kỳ phiên nào.
- **Trọng số chọn câu** (`wordWeight`): quá hạn + số lần quên + ease thấp + số lần sai; thẻ đã thuộc chắc (≥ 21 ngày, chưa đến hạn) ×0.4.
- **Kiểm tra chặng**: mỗi 5 bài/cấp (`cp-hsk<n>-<k>`), chặng cuối cấp phủ cả cấp. Bài đầu chặng sau cần đạt chặng trước,
  TRỪ KHI bài đó đã có tiến độ (không khoá lại người học cũ) hoặc nằm trong phạm vi xếp lớp.
- **Bài cần ôn**: đã học và ≥ 40% từ của bài đến hạn. Phiên luyện trả lời trúng từ đang đến hạn = `review(id, 2)`, sai = `review(id, 0)`.
- Nhiệm vụ ngày tính từ `history[today]` + `tests[daily-…]` — không lưu thêm.

## Thay đổi schema dữ liệu người dùng (QUAN TRỌNG)
1. Tăng `version` trong `persist` của store bị đổi.
2. Viết `migrate(persisted, fromVersion)` xử lý **mọi** version cũ hơn theo chuỗi (v1→v2→v3…).
3. Cập nhật `schema` trong file xuất và nhánh migrate khi nhập file cũ.
4. Đổi `id` từ vựng → map id cũ → id mới trong migrate, không xoá thẻ.
5. Ghi lại thay đổi vào mục "Lịch sử schema" bên dưới.

## Xuất / Nhập
- Xuất: `{ app: "hoc-tieng-trung", schema, exportedAt, progress, settings }`, tên file `hoc-tieng-trung-YYYY-MM-DD.json`.
- Nhập: kiểm tra `app`, chặn `schema` mới hơn app ("Hãy cập nhật ứng dụng"), migrate nếu cũ hơn.
  Gộp: theo từng thẻ lấy bản có `updatedAt` mới hơn; lịch sử cộng theo ngày lấy max; XP lấy max.
- Luôn hỏi xác nhận trước khi "Thay thế" hoặc "Xoá tiến độ".

## Lịch sử schema
- v1 — khởi tạo (cards, lessons, history, xp, badges, favorites).
- v2 — thêm `placement?: { lessonId, at }` (kết quả kiểm tra xếp lớp; mở sẵn các bài tới bài sau `lessonId`).
  Migrate v1→v2: giữ nguyên dữ liệu, không có `placement`. Gộp khi nhập: lấy `placement` có `at` mới hơn.
- v3 — thêm `tests: Record<id, { best, last, attempts, at }>` và `mistakes: Record<khoá, { count, last }>`.
  Migrate v2→v3: thêm hai object rỗng. Gộp: tests lấy best max / last theo `at` mới hơn; mistakes lấy bản `last` mới hơn.
- v4 — thêm `worksheets: Record<id, SavedWorksheet>` (vở tập viết đã lưu: title, words, options, createdAt, updatedAt).
  Migrate v3→v4: thêm object rỗng. Gộp: trùng id lấy bản `updatedAt` mới hơn. Bản nháp chưa lưu nằm ở `store/session` (không persist).
- Settings v2 — thêm `soundEffects` (mặc định bật); migrate gộp với giá trị mặc định.
