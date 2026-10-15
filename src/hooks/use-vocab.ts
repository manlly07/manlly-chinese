import { useEffect, useState } from "react";
import { availableVocabLevels, loadVocab, type Word } from "@/lib/content";

interface VocabState {
  words: Word[];
  loading: boolean;
  error: boolean;
}

/** Tải từ vựng các cấp (mặc định: mọi cấp đã có). */
export function useVocab(levels: number[] = availableVocabLevels()): VocabState {
  const key = levels.join(",");
  const [state, setState] = useState<VocabState>({ words: [], loading: true, error: false });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    Promise.all(key.split(",").filter(Boolean).map((l) => loadVocab(Number(l))))
      .then((lists) => alive && setState({ words: lists.flat(), loading: false, error: false }))
      .catch(() => alive && setState({ words: [], loading: false, error: true }));
    return () => {
      alive = false;
    };
  }, [key]);

  return state;
}
