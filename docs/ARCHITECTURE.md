# Kiến trúc

## 1. Tổng thể

```
UI (features/*, components/*)
   │  đọc/ghi qua hook
   ▼
Stores (zustand)  ── progress, settings, session (không persist)
   │  persist qua storage adapter
   ▼
Repository (lib/repository)  ── LocalRepository (localStorage/IndexedDB)  → sau này ApiRepository
   │
Content loader (lib/content)  ── import() JSON tĩnh trong src/content theo cấp
```

- **Content** (từ vựng, bài học, ngữ pháp…) là **chỉ đọc**, đóng gói cùng app.
- **Progress** (SRS, lịch sử, XP, cài đặt) là dữ liệu người dùng, **ghi được**, lưu cục bộ.
- Hai loại này tách biệt hoàn toàn: progress chỉ tham chiếu content bằng `id` ổn định.

## 2. Định danh

- Từ: `id = "<hanzi>|<pinyin không dấu, không cách>"` ví dụ `"行|xing"` và `"行|hang"` → tránh trùng chữ đa âm.
  Không đổi `id` sau khi phát hành (sẽ làm mất tiến độ). Nếu buộc phải đổi → viết migrate.
- Chữ: `id = <hanzi>`. Bài học: `"<level>-<số thứ tự 2 chữ số>"`, vd `"hsk1-03"`. Ngữ pháp: `"g-hsk1-<slug>"`.

## 3. State (zustand)

```ts
// store/progress.ts  — persist, key "htt-progress", version N
cards:     Record<WordId, CardState>          // SRS
lessons:   Record<LessonId, { best: number; completedAt?: number }>
history:   Record<DateKey, DayStat>           // "YYYY-MM-DD" theo giờ địa phương
xp: number; badges: string[]; streakFreezeUsedWeek?: string
favorites: WordId[]

// store/settings.ts — persist, key "htt-settings"
theme, hskStandard: "2.0" | "3.0", dailyGoalXp, newPerDay, ttsRate, voiceURI,
showPinyin, showHanViet, hanziSize, reviewFront: "hanzi" | "meaning" | "audio"

// store/session.ts — KHÔNG persist: hàng đợi ôn hiện tại, câu quiz đang làm…
```

- Mọi thay đổi schema persist: tăng `version`, viết `migrate(old, fromVersion)`; không bao giờ xoá dữ liệu cũ âm thầm.
- Hàm nghiệp vụ thuần (SRS, tính streak, XP) nằm trong `lib/` và có thể test độc lập; store chỉ gọi chúng.

## 4. Lưu trữ

- localStorage cho progress/settings (đủ cho ~10.000 thẻ, ~1–2MB).
- IndexedDB (`idb-keyval`) cho dữ liệu lớn: lịch sử chi tiết từng lượt ôn, ghi âm luyện nói (giai đoạn sau).
- **Xuất**: `{ app: "hoc-tieng-trung", schema: N, exportedAt, progress, settings }` → tải file `.json`.
- **Nhập**: kiểm tra `app` + `schema`, chạy migrate nếu cũ hơn, hỏi "Gộp" hay "Thay thế".

## 5. Repository (đường nối sang server sau này)

```ts
interface ProgressRepository {
  load(): Promise<ProgressSnapshot | null>;
  save(s: ProgressSnapshot): Promise<void>;
  export(): Promise<Blob>;
  import(file: File, mode: "merge" | "replace"): Promise<void>;
}
```
Hiện chỉ có `LocalProgressRepository`. Khi có server: thêm `ApiProgressRepository` + đồng bộ
theo `updatedAt` từng thẻ (last-write-wins), UI không đổi.

## 6. Routing

`HashRouter`. Route chính: `/`, `/path`, `/lesson/:id`, `/pronunciation`, `/vocab`, `/vocab/:wordId`,
`/hanzi`, `/hanzi/:char`, `/review`, `/grammar`, `/grammar/:id`, `/listening`, `/reading`, `/reading/:id`,
`/quiz`, `/exam`, `/dictionary`, `/stats`, `/settings`. Mỗi page `React.lazy` để tách bundle.

## 7. Âm thanh

- `lib/speech.ts`: chọn giọng `zh-CN` (ưu tiên giọng người dùng chọn), `speak(text, rate)`, `hasChineseVoice()`.
  Nếu máy không có giọng tiếng Trung → hiện hướng dẫn cài giọng (Windows/Android/iOS) thay vì im lặng.
- Giai đoạn sau có thể thay bằng file audio thu sẵn: content có trường `audio?` → ưu tiên audio, fallback TTS.

## 8. PWA / Offline (giai đoạn 4)

`vite-plugin-pwa`, precache app shell + content JSON đã mở; cache dữ liệu nét chữ hanzi-writer theo nhu cầu.
