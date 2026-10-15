import { useMemo } from "react";
import { useVocab } from "@/hooks/use-vocab";
import { buildCharIndex, type CharInfo } from "@/lib/content";

/** Danh sách chữ Hán suy ra từ từ vựng, theo thứ tự cấp → thứ tự xuất hiện. */
export function useChars() {
  const { words, loading } = useVocab();
  const index = useMemo(() => buildCharIndex(words), [words]);
  const list = useMemo<CharInfo[]>(() => [...index.values()].sort((a, b) => a.level - b.level), [index]);
  return { index, list, loading };
}
