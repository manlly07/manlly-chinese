import { dateKey } from "@/lib/date";
import { migrateProgress } from "./migrate";
import { APP_ID, type ExportFile, PROGRESS_SCHEMA, type ProgressData, type ProgressRepository, type SettingsData } from "./types";

export class ImportError extends Error {}

export const localProgressRepository: ProgressRepository = {
  exportFile(progress: ProgressData, settings: SettingsData): Blob {
    const file: ExportFile = {
      app: APP_ID,
      schema: PROGRESS_SCHEMA,
      exportedAt: new Date().toISOString(),
      progress,
      settings,
    };
    return new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  },

  async parseImport(file: File): Promise<ExportFile> {
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      throw new ImportError("File không phải JSON hợp lệ.");
    }
    const data = raw as Partial<ExportFile>;
    if (data?.app !== APP_ID) throw new ImportError("Đây không phải file sao lưu của Manlly 中文.");
    if (typeof data.schema !== "number" || !data.progress) throw new ImportError("File sao lưu bị thiếu dữ liệu.");
    if (data.schema > PROGRESS_SCHEMA)
      throw new ImportError("File được tạo từ phiên bản mới hơn. Hãy cập nhật ứng dụng rồi thử lại.");
    return {
      ...(data as ExportFile),
      schema: PROGRESS_SCHEMA,
      progress: migrateProgress(data.progress, data.schema),
    };
  },
};

export const exportFileName = () => `${APP_ID}-${dateKey()}.json`;

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
