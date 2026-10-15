---
name: create-feature-page
description: Tạo hoặc mở rộng một trang/tính năng của app học tiếng Trung (route, điều hướng, page, component, hook, kết nối store). Dùng khi được yêu cầu làm module mới như Từ vựng, Ôn tập, Phát âm, Luyện viết, Quiz, Ngữ pháp, Nghe, Đọc, Thống kê, Cài đặt, hoặc thêm chức năng vào trang có sẵn.
---

# Tạo trang tính năng

Đọc trước: `CLAUDE.md`, mục tương ứng trong `docs/PRODUCT.md` (tiêu chí chấp nhận), `docs/ARCHITECTURE.md` §3, §6.

## Các bước
1. **Thư mục**: `src/features/<ten-tinh-nang>/`
   - `<Ten>Page.tsx` — chỉ bố cục + ghép component
   - `components/` — UI riêng của tính năng
   - `use-<ten>.ts` — logic/hook; hàm thuần đặt trong `src/lib/` nếu dùng lại
2. **Route**: thêm vào `src/App.tsx` với `lazyPage(() => import("@/features/<ten>/<Ten>Page"))` (từ `@/lib/lazy-page` —
   tự tải lại trang khi chunk cũ mất sau triển khai), `Suspense` đã có trong `AppShell`.
3. **Điều hướng**: thêm mục vào mảng `NAV_ITEMS` trong `src/components/layout/nav.ts` (label tiếng Việt, icon lucide, path).
   Mobile chỉ hiện 5 mục chính; mục phụ vào menu "Thêm".
4. **Dữ liệu**:
   - Content: qua loader `src/lib/content.ts` (`loadVocab(level)`, `loadGrammar(level)`…) — không import JSON trực tiếp trong page.
   - Progress/cài đặt: `useProgress`, `useSettings` (selector hẹp: `useProgress(s => s.cards[id])` để tránh render lại).
   - Ghi tiến độ (ôn, quiz, hoàn thành bài) **chỉ qua action của store** — xem skill `srs-and-progress`.
   - Bài tập/kiểm tra: dùng `ExerciseRunner` + `SessionResult` (đã có combo, âm thanh, sổ lỗi sai); sinh đề trong `lib/review-mix.ts`.
5. **UI**: dùng component shadcn trong `@/components/ui` và component học chung trong `@/components/learning`
   (`HanziText`, `PinyinText`, `SpeakButton`, `HanziWriterBox`, `WordCard`). Thiếu component shadcn → skill `shadcn-ui`.
6. **Trạng thái biên**: loading (skeleton), rỗng (hướng dẫn bước tiếp theo, có nút hành động), máy không có giọng zh-CN, lỗi tải dữ liệu nét chữ (offline).
7. **Bàn phím & mobile**: phím tắt cho hành động lặp (ghi chú phím trên nút ở desktop); vùng chạm ≥ 44px.
8. **Kiểm tra**: `npm run build`; mở ở 360px và desktop, sáng/tối.

## Mẫu page

```tsx
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function VocabPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Từ vựng" description="Duyệt và tra cứu từ theo cấp HSK" />
      <Card><CardContent className="p-4">…</CardContent></Card>
    </div>
  );
}
```

## Văn phong UI
Tiếng Việt, xưng "bạn", ngắn. Nút là động từ: "Bắt đầu ôn", "Thêm vào ôn tập", "Nghe lại".
Khen ngắn khi đúng ("Chính xác!"), động viên khi sai ("Chưa đúng — đáp án là …"), không chê.
