/**
 * Dữ liệu nét chữ (đường viền SVG của từng nét, đúng thứ tự viết) từ hanzi-writer-data trên jsDelivr —
 * nguồn mạng duy nhất được phép cho nét chữ (CLAUDE.md §2). Toạ độ 1024×1024, trục y lật:
 * vẽ trong `<g transform="translate(0, 900) scale(1, -1)">`.
 */
export interface StrokeData {
  strokes: string[];
  /** chỉ số các nét thuộc bộ thủ */
  radStrokes?: number[];
}

/** Khớp phiên bản hanzi-writer đang dùng (HanziWriterBox tải cùng nguồn). */
const CDN = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1";
const cache = new Map<string, Promise<StrokeData | null>>();

/** Nét của một chữ; `null` khi không có dữ liệu hoặc mất mạng (giao diện tự chuyển sang chữ in). */
export function loadStrokeData(char: string): Promise<StrokeData | null> {
  let p = cache.get(char);
  if (!p) {
    p = fetch(`${CDN}/${encodeURIComponent(char)}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<StrokeData>) : null))
      .catch(() => null);
    // lỗi mạng thì cho phép thử lại lần sau
    void p.then((d) => d || cache.delete(char));
    cache.set(char, p);
  }
  return p;
}

export async function loadStrokeMap(chars: string[]): Promise<Map<string, StrokeData | null>> {
  const list = await Promise.all(chars.map(async (c) => [c, await loadStrokeData(c)] as const));
  return new Map(list);
}
