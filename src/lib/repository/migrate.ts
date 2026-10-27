import type { ProgressData } from "./types";

export const emptyProgress = (): ProgressData => ({
  cards: {},
  lessons: {},
  history: {},
  xp: 0,
  badges: [],
  favorites: [],
  tests: {},
  mistakes: {},
  worksheets: {},
});

/**
 * Nâng dữ liệu tiến độ từ `fromVersion` lên schema hiện tại, theo chuỗi v1→v2→…
 * Không bao giờ xoá dữ liệu cũ âm thầm. Dùng chung cho persist của store và cho nhập file.
 */
export function migrateProgress(persisted: unknown, fromVersion: number): ProgressData {
  const data: ProgressData = { ...emptyProgress(), ...(persisted as Partial<ProgressData>) };
  // v1 → v2: thêm trường tuỳ chọn `placement` — dữ liệu cũ giữ nguyên, chưa có kết quả xếp lớp.
  if (fromVersion < 2) delete data.placement;
  // v2 → v3: thêm `tests` và `mistakes` (rỗng); không đụng dữ liệu cũ.
  if (fromVersion < 3) {
    data.tests = data.tests ?? {};
    data.mistakes = data.mistakes ?? {};
  }
  // v3 → v4: thêm `worksheets` (vở tập viết đã lưu, rỗng).
  if (fromVersion < 4) data.worksheets = data.worksheets ?? {};
  return data;
}
