import type { CuteName } from "@/components/learning/CuteIcon";

export interface NavItem {
  label: string;
  path: string;
  /** icon minh hoạ (components/learning/CuteIcon) */
  icon: CuteName;
  /** hiện trên thanh dưới mobile (tối đa 5 mục, mục cuối là "Thêm") */
  mobile?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Tổng quan", path: "/", icon: "home", mobile: true },
  { label: "Lộ trình", path: "/path", icon: "path", mobile: true },
  { label: "Ôn tập", path: "/review", icon: "review", mobile: true },
  { label: "Luyện tập", path: "/practice", icon: "practice", mobile: true },
  { label: "Từ vựng", path: "/vocab", icon: "vocab" },
  { label: "Phát âm", path: "/pronunciation", icon: "pronunciation" },
  { label: "Chữ Hán", path: "/hanzi", icon: "hanzi" },
  { label: "Ngữ pháp", path: "/grammar", icon: "grammar" },
  { label: "Nghe", path: "/listening", icon: "listening" },
  { label: "Đọc hiểu", path: "/reading", icon: "reading" },
  { label: "Từ điển", path: "/dictionary", icon: "dictionary" },
  { label: "Thống kê", path: "/stats", icon: "stats" },
  { label: "Cài đặt", path: "/settings", icon: "settings" },
];
