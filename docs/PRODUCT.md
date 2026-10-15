# Đặc tả sản phẩm

## 1. Người dùng

- Người Việt, từ **chưa biết gì** đến **thành thạo** (đọc báo, xem phim, giao tiếp công việc).
- Học tự do trên web, điện thoại là thiết bị chính. Không có tài khoản (giai đoạn không server).

## 2. Lộ trình học (Learning Path)

Lộ trình chia **giai đoạn → cấp → bài**. Mỗi bài trộn: từ vựng + chữ Hán + ngữ pháp + hội thoại + bài tập.

| Giai đoạn | Cấp | Mục tiêu đầu ra | Khối lượng ước tính |
|---|---|---|---|
| 0. Nhập môn | Pinyin & thanh điệu | Đọc đúng mọi âm tiết pinyin, phân biệt 4 thanh, biết biến điệu | ~10 bài |
| 1. Sơ cấp | HSK 1–2 (HSK 3.0: 1–2) | Giao tiếp sinh tồn, ~300–1.200 từ, nét & bộ thủ cơ bản | ~40 bài |
| 2. Trung cấp | HSK 3–4 (HSK 3.0: 3–5) | Hội thoại hằng ngày, đọc đoạn ngắn, ~1.200–3.000 từ | ~60 bài |
| 3. Cao cấp | HSK 5–6 (HSK 3.0: 6–9) | Đọc báo, nghe tin, viết đoạn văn, thành ngữ, ~5.000+ từ | ~80 bài |

Dữ liệu gắn cả `hsk2` (1–6) và `hsk3` (1–9) để người dùng chọn chuẩn thi mình theo.
Có **bài kiểm tra xếp lớp** để người đã biết chút ít nhảy vào đúng cấp.

## 3. Module & tiêu chí chấp nhận

### 3.1 Tổng quan (Dashboard) `/`
- Chuỗi ngày học (streak), XP hôm nay / mục tiêu ngày, số thẻ đến hạn ôn, từ đã thuộc.
- Nút hành động chính: "Tiếp tục bài học", "Ôn tập (N)", "Học từ mới".
- Thanh tiến độ theo cấp; lịch hoạt động 12 tuần (heatmap).

### 3.2 Lộ trình & Bài học `/path`, `/lesson/:id`
- Bản đồ bài học theo cấp; bài sau mở khi bài trước đạt ≥ 80%.
- Bài học gồm các bước: Giới thiệu từ → Nghe/nhắc lại → Ngữ pháp → Hội thoại → Bài tập → Tổng kết.
- Hoàn thành bài: cộng XP, đưa từ của bài vào SRS.

### 3.3 Phát âm `/pronunciation`
- Bảng thanh mẫu/vận mẫu đầy đủ, mẹo phát âm so sánh với tiếng Việt, bấm nghe ví dụ.
- Luyện thanh điệu: nghe → chọn thanh (1–4), nghe cặp từ → chọn tổ hợp thanh.
- Quy tắc biến điệu: 3-3, 一, 不, thanh nhẹ.
- Luyện nói (nếu có `SpeechRecognition`): đọc từ, so khớp kết quả nhận dạng.

### 3.4 Từ vựng `/vocab`
- Duyệt theo cấp/chủ đề; tìm theo Hán tự, pinyin (có/không dấu), nghĩa Việt, Hán Việt.
- Thẻ từ: Hán tự, pinyin tô màu thanh, nghĩa, Hán Việt, loại từ, ví dụ câu, nút nghe, yêu thích, thêm vào ôn tập.
- Trang chi tiết từ: các chữ thành phần (bấm sang trang chữ), từ ghép liên quan, thứ tự nét.

### 3.5 Chữ Hán `/hanzi`
- Bộ thủ thường gặp (214, ưu tiên ~100 hay dùng) với nghĩa, Hán Việt.
- Trang chữ: số nét, bộ thủ, cấu tạo, Hán Việt, hoạt ảnh thứ tự nét, tập viết có chấm lỗi (hanzi-writer quiz).
- Chế độ "Viết theo nghĩa": hiện nghĩa + pinyin → người dùng viết từ trí nhớ.

### 3.6 Ôn tập SRS `/review`
- Thẻ đến hạn + giới hạn từ mới/ngày. Mặt trước tuỳ chọn: Hán tự / nghĩa / âm thanh.
- Chấm 4 mức: Quên / Khó / Được / Dễ, hiển thị khoảng ôn tiếp theo trên nút.
- Phím tắt: Space lật, 1–4 chấm. Tự đọc khi lật (tuỳ chọn).

### 3.7 Ngữ pháp `/grammar`
- Điểm ngữ pháp theo cấp: cấu trúc, giải thích tiếng Việt, ví dụ (pinyin + dịch), lỗi người Việt hay mắc.
- Bài tập: sắp xếp câu, điền chỗ trống, chọn câu đúng.

### 3.8 Nghe & Hội thoại `/listening`
- Hội thoại theo tình huống; chế độ: nghe ẩn chữ → hiện pinyin → hiện chữ → hiện dịch.
- Chép chính tả (nghe gõ pinyin hoặc Hán tự), điều chỉnh tốc độ đọc.

### 3.9 Đọc hiểu `/reading`
- Bài đọc phân cấp; chạm vào từ để xem nghĩa (từ điển popup), bật/tắt pinyin trên đầu chữ (ruby).
- Câu hỏi đọc hiểu cuối bài; thêm từ lạ vào SRS bằng 1 chạm.

### 3.10 Luyện tập & Kiểm tra `/quiz`, `/exam`
- Quiz nhanh: Hán→nghĩa, nghĩa→Hán, nghe→Hán, pinyin→Hán, chọn thanh.
- Đề thi thử theo cấu trúc HSK (nghe/đọc/viết) có tính giờ và chấm điểm.
- Từ trả lời sai tự động đưa vào SRS.

### 3.11 Từ điển `/dictionary`
- Tra Hán↔Việt trên dữ liệu đã đóng gói (offline), lịch sử tra cứu.

### 3.12 Thống kê `/stats`
- Biểu đồ 30 ngày: số lần ôn, độ chính xác, XP. Phân bố thẻ: mới / đang học / thuộc (interval ≥ 21 ngày).
- Thời gian học ước tính, dự báo số thẻ đến hạn 7 ngày tới.

### 3.13 Cài đặt & Dữ liệu `/settings`
- Giao diện sáng/tối/hệ thống; chuẩn HSK 2.0/3.0; mục tiêu ngày; số từ mới/ngày; tốc độ đọc; giọng đọc.
- Hiện/ẩn pinyin, Hán Việt; kích thước chữ Hán.
- **Xuất/Nhập JSON**, xoá tiến độ (có xác nhận).

### 3.14 Gamification (xuyên suốt)
- XP, streak (có "đóng băng streak" 1 lần/tuần), huy hiệu cột mốc (100 từ, 7 ngày liên tục, hoàn thành cấp…).

## 4. Phi chức năng

- Tải lần đầu < 300KB JS gzip; dữ liệu cấp lazy-load.
- Hoạt động offline sau lần tải đầu (PWA, giai đoạn 4).
- Truy cập được: tương phản đủ, focus rõ, `aria-label` cho nút icon, không dựa riêng vào màu (thanh điệu luôn kèm dấu).
