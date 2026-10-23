import { useCallback } from "react";
import type { Syllable } from "@/lib/content";
import type { Tone } from "@/lib/pinyin";
import { audioUrl, hanziFor, hasAudio } from "@/lib/syllables";
import { useSpeech } from "./use-speech";

// giữ lại phần tử Audio đã tải để bấm lại không phải tải lần nữa
const cache = new Map<string, HTMLAudioElement>();
let current: HTMLAudioElement | null = null;

function playFile(url: string, rate: number): Promise<void> {
  let a = cache.get(url);
  if (!a) {
    a = new Audio(url);
    a.preload = "auto";
    cache.set(url, a);
  }
  current?.pause();
  current = a;
  a.currentTime = 0;
  a.playbackRate = rate;
  return a.play();
}

/**
 * Phát một âm tiết với thanh cho trước: ưu tiên file thu âm người thật, thiếu file (hoặc lỗi tải)
 * thì đọc chữ đại diện bằng giọng máy.
 */
export function useSyllablePlayer() {
  const { say } = useSpeech();
  return useCallback(
    async (syl: Syllable, tone: Tone, { slow = false }: { slow?: boolean } = {}) => {
      if (hasAudio(syl, tone)) {
        try {
          await playFile(audioUrl(syl, tone), slow ? 0.7 : 1);
          return;
        } catch {
          /* chưa tải được (offline, trình duyệt chặn) → thử giọng máy */
        }
      }
      const h = hanziFor(syl, tone);
      if (h) await say(h, slow ? { rate: 0.6 } : {});
    },
    [say],
  );
}
