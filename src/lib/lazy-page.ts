import { type ComponentType, lazy } from "react";

const KEY = "htt-chunk-reload";

/**
 * React.lazy có tự phục hồi: sau khi triển khai bản mới, tab đang mở có thể tham chiếu chunk cũ
 * (hash đã đổi) → tải lại trang một lần để lấy bản mới, thay vì hiện màn hình lỗi.
 */
export function lazyPage<T extends ComponentType<object>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const mod = await load();
      sessionStorage.removeItem(KEY);
      return mod;
    } catch (e) {
      let reloaded = false;
      try {
        reloaded = sessionStorage.getItem(KEY) === "1";
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* sessionStorage bị chặn — vẫn thử tải lại */
      }
      if (!reloaded) {
        window.location.reload();
        return new Promise<never>(() => {});
      }
      throw e;
    }
  });
}
