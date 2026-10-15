import type { DateKey } from "@/lib/date";
import type { CardState } from "@/lib/srs";
import type { DayStat } from "@/lib/streak";

export type WordId = string;
export type LessonId = string;

export const APP_ID = "hoc-tieng-trung";
/** Phiên bản schema dữ liệu người dùng (khớp version của store progress). */
export const PROGRESS_SCHEMA = 3;

export interface LessonProgress {
  best: number;
  completedAt?: number;
}

export interface ProgressData {
  cards: Record<WordId, CardState>;
  lessons: Record<LessonId, LessonProgress>;
  history: Record<DateKey, DayStat>;
  xp: number;
  badges: string[];
  favorites: WordId[];
  /** v2: kết quả kiểm tra xếp lớp — các bài tới (và gồm) lessonId được mở sẵn */
  placement?: { lessonId: LessonId; at: number };
  /** v3: kết quả bài kiểm tra (kiểm tra chặng "cp-…", tổng hợp tuần "weekly-…") */
  tests: Record<string, TestProgress>;
  /** v3: sổ lỗi sai — khoá "w:<wordId>" hoặc "g:<grammarId>#<chỉ số bài tập>" */
  mistakes: Record<string, MistakeEntry>;
}

export interface TestProgress {
  best: number;
  last: number;
  attempts: number;
  at: number;
}

export interface MistakeEntry {
  count: number;
  last: number;
}

export type ThemeMode = "light" | "dark" | "system";

export interface SettingsData {
  theme: ThemeMode;
  hskStandard: "2.0" | "3.0";
  dailyGoalXp: number;
  newPerDay: number;
  ttsRate: number;
  voiceURI?: string;
  showPinyin: boolean;
  showHanViet: boolean;
  hanziSize: "sm" | "md" | "lg";
  reviewFront: "hanzi" | "meaning" | "audio";
  autoSpeak: boolean;
  /** v2: âm thanh đúng/sai khi làm bài */
  soundEffects: boolean;
}

export interface ExportFile {
  app: typeof APP_ID;
  schema: number;
  exportedAt: string;
  progress: ProgressData;
  settings: SettingsData;
}

export type ImportMode = "merge" | "replace";

/** Đường nối sang server sau này: thêm ApiProgressRepository cùng interface. */
export interface ProgressRepository {
  exportFile(progress: ProgressData, settings: SettingsData): Blob;
  parseImport(file: File): Promise<ExportFile>;
}
