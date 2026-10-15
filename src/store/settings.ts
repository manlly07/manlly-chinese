import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SettingsData } from "@/lib/repository";

export const defaultSettings: SettingsData = {
  theme: "system",
  hskStandard: "2.0",
  dailyGoalXp: 30,
  newPerDay: 10,
  ttsRate: 0.9,
  voiceURI: undefined,
  showPinyin: true,
  showHanViet: true,
  hanziSize: "md",
  reviewFront: "hanzi",
  autoSpeak: true,
  soundEffects: true,
};

interface SettingsStore extends SettingsData {
  set: (patch: Partial<SettingsData>) => void;
  replace: (s: SettingsData) => void;
  reset: () => void;
}

/** v1 → v2: thêm soundEffects (mặc định bật). */
export const SETTINGS_VERSION = 2;

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      set: (patch) => set(patch),
      replace: (s) => set({ ...defaultSettings, ...s }),
      reset: () => set(defaultSettings),
    }),
    {
      name: "htt-settings",
      version: SETTINGS_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => ({ ...defaultSettings, ...(persisted as Partial<SettingsData>) }) as SettingsStore,
    },
  ),
);

/** Lấy bản dữ liệu thuần (không có action) — dùng khi xuất file. */
export function settingsSnapshot(): SettingsData {
  const { set: _s, replace: _r, reset: _x, ...data } = useSettings.getState();
  return data;
}
