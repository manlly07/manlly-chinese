---
name: shadcn-ui
description: Thêm hoặc tuỳ biến component shadcn/ui, theme màu, chế độ sáng/tối và style Tailwind của dự án. Dùng khi cần một component UI mới (dialog, select, toast, tooltip, sheet…), đổi giao diện, màu sắc, font, hoặc sửa lỗi hiển thị.
---

# shadcn/ui trong dự án

Cấu hình: `components.json` (style default, baseColor stone, cssVariables, alias `@/components/ui`).
Tailwind **v3** (`tailwind.config.ts`), token màu trong `src/index.css`.

## Thêm component
1. Ưu tiên CLI (cần mạng tới registry npm):
   ```bash
   npx shadcn@2.1.8 add dialog
   ```
   Dùng bản 2.x vì dự án dùng Tailwind 3 (bản CLI mới nhất nhắm Tailwind 4).
2. Không chạy được CLI → tự viết file theo mã nguồn shadcn chuẩn vào `src/components/ui/<ten>.tsx`,
   cài Radix tương ứng (`@radix-ui/react-<ten>`), dùng `cn()` từ `@/lib/utils`.
3. Không sửa logic trong `components/ui/*`; tuỳ biến bằng `className`/biến thể `cva` ở nơi dùng
   hoặc thêm variant mới vào `cva` (vd. `Button` variant `tone`).

## Theme
- Phong cách **tươi sáng, dễ thương (cute)**: hồng dâu chủ đạo (`--primary`), nền kem hồng có chấm bi nhẹ, font Nunito đậm.
  Bo góc lớn (`--radius: 1.25rem`), nút `rounded-full` có hiệu ứng "nảy" (`.btn-pop`, bóng đáy theo `--btn-shadow`), thẻ dùng `shadow-soft`.
- Màu pastel phụ: `bg-candy-{pink|yellow|mint|sky|lilac}` + `text-candy-*-foreground` (luôn đi theo cặp để đủ tương phản) —
  dùng cho ô thống kê, icon, huy hiệu, mục đang chọn. Không dùng candy cho pinyin (pinyin chỉ dùng `tone-*`).
- **Icon minh hoạ**: `<CuteIcon name="…" />` (`components/learning/CuteIcon.tsx`, ~30 icon SVG kawaii cùng phong cách Mascot:
  viền mực, khối kẹo, mặt cười). Dùng cho điều hướng (`nav.ts` → `icon`), tiêu đề trang (`<PageHeader icon=…>`), ô chỉ số,
  thẻ lối tắt, nhiệm vụ, màn kết quả. Icon đường nét lucide chỉ dùng **bên trong nút/điều khiển nhỏ** (X, mũi tên, loa…).
  - Viền dùng `var(--cute-ink)` (tím than ở sáng / tím nhạt ở tối) để nét đứng riêng không chìm vào nền tối;
    mắt/miệng luôn dùng mực đậm `INK` vì nằm trên khối màu sáng.
  - Thêm icon mới: viewBox 48, nét 2.4 bo tròn, dùng bảng màu `C` + `<Face />`; render thử ở 24px và 64px trên cả nền sáng/tối.
  - Icon trang trí → không cần `label`; icon đứng một mình mang nghĩa → truyền `label`.
- Linh vật: `<Mascot mood="happy|sleepy" />` (`components/learning/Mascot.tsx`, SVG thuần) cho lời chào, trạng thái rỗng, chúc mừng.
- Chuyển động nhẹ (`animate-wiggle`) luôn tắt khi `prefers-reduced-motion`.
- Màu mới phải kiểm tra tương phản ≥ 4.5:1 ở cả sáng và tối trước khi dùng.
- Dark mode: class `dark` trên `<html>`, điều khiển bởi `settings.theme` (`light | dark | system`).
- Thêm màu mới: khai báo HSL không có `hsl()` trong cả `:root` và `.dark`, rồi map trong `tailwind.config.ts`.
- Màu thanh điệu: `tone-1..5` — chỉ dùng cho pinyin/thanh điệu.

## Pinyin
- Mọi pinyin hiển thị phải có class `font-pinyin` (Mali). `PinyinText` đã tự gắn; chuỗi pinyin thô (câu ví dụ `py`) phải tự thêm.
  Lý do: Nunito thiếu glyph ǎ ǐ ǒ ǔ, Baloo 2 hiển thị lỗi dấu ngang (ā ē) — đã kiểm tra bằng ảnh chụp.
- Đổi font pinyin → phải chụp màn hình kiểm tra đủ 4 thanh × a e i o u ü ở các độ đậm dùng trong app.

## Biểu đồ
- Màu: `bg-chart-series` (một chuỗi), `bg-chart-new|learning|mature` (phân bố thẻ) — đã kiểm định bằng skill `dataviz`.
- Dùng `components/learning/BarChart.tsx` (tooltip khi rê/chạm/focus + "Xem dạng bảng").

## Chữ Hán
- Luôn dùng class `hanzi` (font Noto Serif SC). Kích thước gợi ý: thẻ flashcard `text-7xl md:text-8xl`, danh sách `text-3xl`, trong câu `text-xl`.
- Ruby pinyin: `<ruby>学<rt>xué</rt></ruby>`, `rt` dùng `text-[0.45em]` + màu thanh.

## Component học chung (`src/components/learning/`)
Tạo một lần, dùng mọi nơi: `HanziText`, `PinyinText` (tô màu theo âm tiết), `SpeakButton`, `HanziWriterBox`
(lưới 米字格 nền SVG), `WordCard`, `ToneBadge`, `ProgressRing`. Sửa ở đây thay vì nhân bản style.

## Accessibility
Nút chỉ có icon phải có `aria-label` tiếng Việt; focus ring giữ nguyên (`ring-ring`); tương phản chữ ≥ 4.5:1 ở cả hai chế độ.
