import { create } from "zustand";

/** Trạng thái phiên — KHÔNG persist (hàng đợi ôn, câu quiz đang làm…). */
interface SessionStore {
  reviewQueue: string[];
  setReviewQueue: (ids: string[]) => void;
}

export const useSession = create<SessionStore>()((set) => ({
  reviewQueue: [],
  setReviewQueue: (reviewQueue) => set({ reviewQueue }),
}));
