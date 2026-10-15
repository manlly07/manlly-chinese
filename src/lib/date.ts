/** Ngày theo giờ địa phương dạng "YYYY-MM-DD" (không dùng toISOString — lệch UTC). */
export type DateKey = string;

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

const pad = (n: number) => String(n).padStart(2, "0");

export function dateKey(d: Date | number = Date.now()): DateKey {
  const x = typeof d === "number" ? new Date(d) : d;
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}

/** "YYYY-MM-DD" → Date lúc 00:00 giờ địa phương */
export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Cộng/trừ số ngày theo lịch (an toàn với giờ mùa hè). */
export function addDays(key: DateKey, days: number): DateKey {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

/** Số ngày lịch từ a tới b (b - a). */
export function daysBetween(a: DateKey, b: DateKey): number {
  return Math.round((parseDateKey(b).getTime() - parseDateKey(a).getTime()) / DAY);
}

/** Tuần ISO dạng "YYYY-Www" — dùng cho đóng băng streak. */
export function isoWeekKey(key: DateKey): string {
  const d = parseDateKey(key);
  const day = (d.getDay() + 6) % 7; // Thứ 2 = 0
  d.setDate(d.getDate() - day + 3); // Thứ 5 của tuần quyết định năm ISO
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / DAY - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${pad(week)}`;
}

/** Khoảng thời gian ngắn gọn tiếng Việt: "10 phút", "3 ngày", "2 tháng", "1,5 năm". */
export function formatInterval(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))} phút`;
  if (ms < DAY) return `${Math.round(ms / HOUR)} giờ`;
  const days = ms / DAY;
  if (days < 30) return `${Math.round(days)} ngày`;
  if (days < 365) return `${Math.round(days / 30)} tháng`;
  return `${(Math.round((days / 365) * 10) / 10).toLocaleString("vi-VN")} năm`;
}
