import { create } from "zustand";
import type { SheetOptions, SheetWord } from "@/lib/worksheet";

/** Vở tập viết đang soạn. `id` = vở đã lưu đang mở (mọi thay đổi tự lưu vào đó), `null` = bản nháp chưa lưu. */
export interface WorksheetDoc {
  id: string | null;
  title: string;
  words: SheetWord[];
  options: SheetOptions;
}

/** Trạng thái phiên — KHÔNG persist (hàng đợi ôn, câu quiz đang làm…). */
interface SessionStore {
  reviewQueue: string[];
  setReviewQueue: (ids: string[]) => void;
  /** vở đang soạn — giữ khi chuyển trang trong app (mất khi tải lại nếu chưa lưu) */
  worksheetDraft: WorksheetDoc | null;
  setWorksheetDraft: (doc: WorksheetDoc | null) => void;
}

export const useSession = create<SessionStore>()((set) => ({
  reviewQueue: [],
  setReviewQueue: (reviewQueue) => set({ reviewQueue }),
  worksheetDraft: null,
  setWorksheetDraft: (worksheetDraft) => set({ worksheetDraft }),
}));
