export * from "./types";
export { emptyProgress, migrateProgress } from "./migrate";
export { mergeProgress } from "./merge";
export { localProgressRepository, ImportError, exportFileName, downloadBlob } from "./local";

import { localProgressRepository } from "./local";
/** Repository đang dùng — đổi sang ApiProgressRepository khi có server. */
export const progressRepository = localProgressRepository;
