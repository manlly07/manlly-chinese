import { DEFAULT_SHEET_OPTIONS, type SheetOptions, type SheetWord } from "@/lib/worksheet";
import { useProgress } from "@/store/progress";
import { useSession, type WorksheetDoc } from "@/store/session";

const DEFAULT_TITLE = "Bài luyện viết";
const blank = (): WorksheetDoc => ({ id: null, title: DEFAULT_TITLE, words: [], options: DEFAULT_SHEET_OPTIONS });
const BLANK = blank();

type Updater<T> = T | ((prev: T) => T);
const apply = <T,>(v: Updater<T>, prev: T): T => (typeof v === "function" ? (v as (p: T) => T)(prev) : v);
const newId = () => `ws-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * Vở đang soạn: bản nháp nằm trong store phiên (đổi trang không mất);
 * vở đã lưu (`id`) thì mỗi thay đổi ghi thẳng vào tiến độ (localStorage + có trong file sao lưu).
 */
export function useWorksheetDoc() {
  const doc = useSession((s) => s.worksheetDraft) ?? BLANK;
  const setDraft = useSession((s) => s.setWorksheetDraft);
  const saveWorksheet = useProgress((s) => s.saveWorksheet);
  const deleteWorksheet = useProgress((s) => s.deleteWorksheet);

  const update = (patch: (d: WorksheetDoc) => Partial<WorksheetDoc>) => {
    const cur = useSession.getState().worksheetDraft ?? BLANK;
    const next = { ...cur, ...patch(cur) };
    setDraft(next);
    if (next.id) saveWorksheet({ id: next.id, title: next.title, words: next.words, options: next.options });
  };

  return {
    doc,
    setList: (v: Updater<SheetWord[]>) => update((d) => ({ words: apply(v, d.words) })),
    setTitle: (title: string) => update(() => ({ title })),
    setOptions: (v: Updater<SheetOptions>) => update((d) => ({ options: apply(v, d.options) })),
    /** Bắt đầu vở mới chưa lưu (vd. mở từ bài học) — `words`/`title` tuỳ chọn. */
    start: (seed: Partial<Pick<WorksheetDoc, "title" | "words">> = {}) => setDraft({ ...blank(), ...seed }),
    /** Lưu bản nháp thành vở mới; từ đó tự lưu. */
    save: () => update(() => ({ id: newId() })),
    open: (id: string) => {
      const w = useProgress.getState().worksheets[id];
      if (w) setDraft({ id, title: w.title, words: w.words, options: { ...DEFAULT_SHEET_OPTIONS, ...w.options } });
    },
    /** Xoá vở đã lưu; nếu đang mở thì nội dung vẫn còn, thành bản nháp chưa lưu. */
    remove: (id: string) => {
      deleteWorksheet(id);
      const cur = useSession.getState().worksheetDraft;
      if (cur?.id === id) setDraft({ ...cur, id: null });
    },
  };
}
