# Lộ trình triển khai

Mỗi giai đoạn kết thúc bằng một bản build chạy được.

## Giai đoạn 0 — Nền móng
- [x] `npm install`, `src/main.tsx`, `App.tsx` (HashRouter), AppShell (sidebar desktop + thanh điều hướng dưới trên mobile)
- [x] shadcn: button, card, badge, progress, tabs, input, switch, dialog, dropdown-menu, sonner (toast), tooltip
- [x] `lib/`: utils, pinyin (dấu thanh ↔ số, tách âm tiết, tô màu, biến điệu), speech, srs, date, streak, xp, content
- [x] Store `settings` + `progress` (persist, version 1), giao diện sáng/tối; repository + xuất/nhập JSON
- [x] `scripts/validate-content.mjs` (đã có)
- Thêm: trang Tổng quan, trang Cài đặt (đủ tuỳ chọn + sao lưu/khôi phục/xoá), trang tạm cho các route chưa làm

## Giai đoạn 1 — Học được ngay (MVP)
- [x] Nội dung: pinyin.json, HSK 1 (154 từ) + ví dụ, HSK 2 (150 từ) + ví dụ
  - ⚠ Danh sách cấp soạn theo danh sách HSK 2.0 công khai (chưa đối chiếu bản chính thức); `hsk3` để `null`.
    Cần đối chiếu: vài từ có thể lệch cấp 1/2 (vd. 零, 日, 火车站).
- [x] Phát âm: thanh điệu (đường cao độ), bảng pinyin + mẹo so với tiếng Việt, luyện nghe (đơn/cặp), biến điệu
- [x] Từ vựng: duyệt theo cấp/chủ đề, tìm (Hán/pinyin có-không dấu/số/nghĩa/Hán Việt), chi tiết + chữ thành phần + từ liên quan
- [x] Ôn tập SRS + học từ mới (giới hạn/ngày, học lại khi Quên, phím tắt, tổng kết)
- [x] Luyện viết chữ (hanzi-writer): xem nét / tô / viết theo nghĩa
- [x] Quiz nhanh 5 dạng (từ sai tự vào SRS)
- [x] Dashboard (tiến độ theo cấp), Thống kê cơ bản (30 ngày, phân bố, dự báo 7 ngày), Cài đặt, Xuất/Nhập JSON
- Chưa có `hanzi/chars.json` — thông tin chữ (pinyin, Hán Việt) đang suy ra từ từ vựng (`buildCharIndex`)

## Giai đoạn 2 — Có lộ trình
- [x] Bài học có cấu trúc HSK 1–2 (40 bài: Mục tiêu → Từ mới → Ngữ pháp → Hội thoại → Bài tập → Tổng kết), bản đồ lộ trình, mở khoá ≥ 80%
- [x] Ngữ pháp HSK 1–2 (48 điểm, có “Người Việt hay nhầm”) + bài tập (sắp xếp, điền, chọn)
- [x] Hội thoại (40 bài, kiểm tra i+1 tự động) + chế độ nghe (ẩn/hiện chữ, pinyin, dịch; giọng khác nhau theo người nói); chép chính tả (chữ Hán hoặc pinyin, 3 tốc độ)
- [x] Bộ thủ (34 bộ thường gặp) trong trang Chữ Hán; kiểm tra xếp lớp (theo chặng 10 bài, progress schema v2)

## Giai đoạn 2b — Học kiểu Duolingo (ôn & kiểm tra thường xuyên)
- [x] Kiểm tra chặng mỗi 5 bài + kiểm tra cuối cấp trên lộ trình (đạt 80% mới đi tiếp; không khoá lại người đã học vượt)
- [x] Ôn tổng hợp hằng ngày (15 câu từ mọi bài đã học, ưu tiên phần sắp quên/hay sai) + Kiểm tra tổng hợp tuần (20 câu, lưu điểm)
- [x] Sổ lỗi sai (ghi tự động, luyện tới khi đúng), bài “cần ôn” trên lộ trình (≥ 40% từ đến hạn)
- [x] Nhiệm vụ hằng ngày, combo đúng liên tiếp, âm thanh đúng/sai (tắt được), màn kết quả theo kỹ năng
- [x] Trung tâm Luyện tập `/practice`; “Việc cần làm hôm nay” trên Tổng quan
- [x] Progress schema v3, settings v2; tự tải lại khi chunk cũ mất sau khi triển khai bản mới (`lib/lazy-page.ts`)
- [ ] Có thể thêm: “tim” (giới hạn lỗi/ngày), rương thưởng, huy hiệu, bảng xếp hạng (cần server)

## Giai đoạn 2c — Học từ thành phần (phản hồi “khó học”)
- [x] Chặng 0 “Nhập môn pinyin” (9 bài `py-01..09`) trước HSK 1: Âm mới → Ghép vần → Bài tập. Bài tập nghe-chọn phụ âm đầu/vần/
  âm tiết/thanh, **tự ghép** âm tiết, quy tắc viết; phần lớn câu dùng âm tiết chưa trình diễn để luyện tự ghép
- [x] Bảng âm tiết `syllables.json` (377 âm, chữ đại diện từng thanh cho TTS), tab “Ghép vần” trong Phát âm
- [x] “Kiểm tra nhanh pinyin” (`/test/pinyin`) để bỏ qua Chặng 0; người học trước đó không bị kéo về Chặng 0
- [x] Cấu tạo chữ `hanzi/chars.json` (sinh từ Make Me a Hanzi) + `components.json`: bước “Bộ mới” trước “Từ mới”,
  tách chữ thành bộ (gợi nghĩa/gợi âm) trong thẻ từ, trang từ, trang chữ; câu “ghép chữ” (亻 + ? = 你) trong bài tập và ôn tập
- [ ] Có thể thêm: bài nét cơ bản (横竖撇点折) trước bộ thủ; ghi âm so sánh khi ghép vần

## Giai đoạn 3 — Trung & cao cấp
- [ ] Nội dung HSK 3–6 (từ vựng, ngữ pháp, bài học), gắn cấp HSK 3.0
- [ ] Đọc hiểu có popup từ điển + ruby pinyin; từ điển offline
- [ ] Đề thi thử HSK có tính giờ
- [x] Luyện nói: ghi âm + phân tích cao độ ngay trên máy (`lib/pitch.ts`, YIN), so với đường thanh chuẩn, ước lượng thanh cho âm tiết/từ; câu ngắn tự đánh giá. Không dùng SpeechRecognition vì Chrome gửi âm thanh lên máy chủ.

## Giai đoạn 4 — Hoàn thiện
- [ ] PWA offline, cài lên màn hình chính
- [ ] Huy hiệu, đóng băng streak, heatmap hoạt động
- [ ] Tối ưu hiệu năng, kiểm tra accessibility
- [ ] Chuẩn bị đường nối server: `ApiProgressRepository`, đồng bộ theo `updatedAt`
