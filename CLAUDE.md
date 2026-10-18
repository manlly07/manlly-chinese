# CLAUDE.md — Bối cảnh dự án "Manlly 中文" (web học tiếng Trung)

File này là ngữ cảnh gốc cho mọi phiên làm việc với dự án. Đọc hết trước khi sửa code.
Chi tiết sâu hơn nằm trong `docs/`; quy trình làm việc lặp lại nằm trong `.claude/skills/`.

## 1. Mục tiêu sản phẩm

Web học tiếng Trung (giản thể) **dành cho người Việt**, đưa người học **từ con số 0 đến thành thạo**
(tương đương HSK 1 → HSK 6 / HSK 3.0 cấp 1 → 9). Đầy đủ tính năng: phát âm, từ vựng, chữ Hán,
ngữ pháp, nghe, đọc, ôn tập ngắt quãng (SRS), kiểm tra, theo dõi tiến độ.

Lợi thế cần khai thác cho người Việt: **âm Hán Việt** (学 = học, 生 = sinh) — luôn hiển thị khi có.

## 2. Ràng buộc cứng

- **Chưa có server.** Toàn bộ chạy phía trình duyệt; dữ liệu học tập lưu cục bộ (localStorage/IndexedDB).
- Build ra **site tĩnh** (`vite build`, `base: "./"`), dùng **HashRouter** để chạy được trên GitHub Pages/Netlify/mở file.
- Phải có **Xuất/Nhập dữ liệu (JSON)** vì không có tài khoản — đây là cách duy nhất để người dùng sao lưu/chuyển máy.
- Mọi truy cập dữ liệu đi qua lớp `repository` (xem `docs/ARCHITECTURE.md`) để sau này thay bằng API mà không sửa UI.
- Giao diện **100% tiếng Việt**. Nội dung học: Hán tự giản thể + pinyin có dấu thanh + nghĩa tiếng Việt (+ Hán Việt).
- Không gửi dữ liệu người dùng ra ngoài. Tài nguyên mạng duy nhất được phép: font Google, dữ liệu nét chữ của `hanzi-writer` (jsDelivr).

## 3. Công nghệ

| Hạng mục | Lựa chọn |
|---|---|
| Build | Vite 5 + React 18 + TypeScript (strict) |
| UI | Tailwind CSS 3 + shadcn/ui (Radix) + lucide-react |
| Router | react-router-dom 6 — `HashRouter` |
| State | zustand + `persist` (có `version` + `migrate`) |
| Lưu trữ lớn | IndexedDB (qua `idb-keyval`) cho lịch sử/ghi âm khi vượt giới hạn localStorage |
| Chữ Hán | `hanzi-writer` (thứ tự nét, tập viết) |
| Phát âm | Web Speech API: `speechSynthesis` (zh-CN) để đọc, `SpeechRecognition` (nếu trình duyệt hỗ trợ) để chấm nói |
| Offline | PWA (`vite-plugin-pwa`) — giai đoạn sau |

Alias import: `@/` → `src/`. Font: `Nunito` (chữ Việt), `Mali` (pinyin, class `font-pinyin` — Nunito thiếu ǎ ǐ ǒ ǔ), `Noto Serif SC` (chữ Hán, class `hanzi`/`font-han`).
Phong cách: **tươi sáng, dễ thương** — bảng màu kẹo ngọt, linh vật gấu trúc, icon minh hoạ `CuteIcon` (xem skill `shadcn-ui`).

## 4. Lệnh

```bash
npm install
npm run dev        # chạy dev
npm run lint       # ESLint toàn bộ, 0 warning (lint:fix để tự sửa)
npm run build      # lint → tsc -b → vite build → dist/
npm run check      # validate-content + build (pre-push chạy lệnh này)
npm run preview
node scripts/validate-content.mjs   # kiểm tra dữ liệu học (bắt buộc chạy sau khi sửa src/content)
```

Git hooks nằm ở `.githooks/` (bật qua `npm install` → script `prepare` đặt `core.hooksPath`):
`pre-commit` lint file đã stage + validate-content nếu sửa `src/content/`; `pre-push` chạy `npm run check`.
ESLint chặn `localStorage` ngoài `src/store/` và `src/lib/repository/`.

> Trạng thái hiện tại: **xong Giai đoạn 0, 1, 2, 2b, 2c** — lộ trình Chặng 0 Nhập môn pinyin (9 bài, ghép vần) + 40 bài HSK 1–2
> (có bước “Bộ mới” học bộ thủ trước khi học chữ), kiểm tra chặng, ôn tổng hợp hằng ngày, kiểm tra tuần, sổ lỗi sai, nhiệm vụ ngày;
> progress schema **v3**, settings **v2**. Còn placeholder: đọc hiểu, thi thử, từ điển.
> Nguyên tắc sư phạm: **học thành phần trước, ghép sau** — phụ âm đầu + vần → âm tiết; bộ → chữ. Khoá sổ lỗi: `w: g: l: p: c:`.
> Trang mới phải đăng ký bằng `lazyPage()` (không dùng `React.lazy` trực tiếp) để tự phục hồi khi triển khai bản mới.
> Toast: `import { toast } from "sonner"`; `<Toaster />` (`components/ui/sonner.tsx`) lấy theme từ `settings.theme`, không dùng next-themes.

## 5. Cấu trúc thư mục (đích)

```
src/
  main.tsx, App.tsx           # HashRouter + layout
  components/
    ui/                       # shadcn — không sửa logic, chỉ chỉnh style qua token
    layout/                   # AppShell, Sidebar, MobileNav
    learning/                 # HanziText, PinyinText, SpeakButton, HanziWriterBox, WordCard...
  features/<tên>/             # mỗi tính năng 1 thư mục: page + component + hook riêng
  content/                    # DỮ LIỆU HỌC (JSON) — xem docs/DATA.md
    vocab/hsk-1.json ...
    grammar/, lessons/, dialogues/, readings/, pinyin.json
  lib/
    srs.ts  pinyin.ts  speech.ts  date.ts  utils.ts
    repository/               # tầng truy cập dữ liệu (local → API sau này)
  store/                      # zustand stores (progress, settings, session)
scripts/validate-content.mjs
```

## 6. Quy ước code

- Component hàm + hook; không class component. Tên file component `PascalCase.tsx`, còn lại `kebab-case.ts`.
- Không gọi `localStorage` trực tiếp trong component — dùng store/repository.
- Dữ liệu học **lazy-load theo cấp** (`import()` động) để bundle đầu nhẹ.
- Chuỗi giao diện viết thẳng tiếng Việt trong JSX (chưa cần i18n), câu ngắn, thân thiện, xưng "bạn".
- Màu thanh điệu dùng token `text-tone-1..5` (định nghĩa trong `index.css`) — không hard-code màu.
- Mọi tính năng phải dùng được trên điện thoại (≥ 360px) và bằng bàn phím (flashcard: Space lật, 1–4 chấm).
- Không thêm thư viện nặng khi chưa cần; hỏi trước nếu > 50KB gzip.

## 7. Định nghĩa "xong"

1. `npm run build` không lỗi, không warning TS.
2. `node scripts/validate-content.mjs` pass nếu có sửa dữ liệu.
3. Chạy được ở chế độ sáng/tối, mobile/desktop.
4. Tiến độ người dùng không bị mất sau khi nâng cấp (tăng `version` store + viết `migrate` nếu đổi schema).

## 8. Tài liệu & skill

- `docs/PRODUCT.md` — đặc tả đầy đủ các module và lộ trình học.
- `docs/ARCHITECTURE.md` — state, lưu trữ, repository, routing, PWA.
- `docs/DATA.md` — schema dữ liệu học, nguồn & giấy phép.
- `docs/ROADMAP.md` — các giai đoạn triển khai.
- Skills (`.claude/skills/`): `chinese-content-conventions`, `add-vocabulary-data`, `write-lesson-content`,
  `create-feature-page`, `shadcn-ui`, `srs-and-progress`.
