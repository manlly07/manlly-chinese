import { useCallback, useEffect, useState } from "react";
import { hasChineseVoice, isSpeechSupported, speak } from "@/lib/speech";
import { useSettings } from "@/store/settings";

/** Đọc chữ Hán theo tốc độ/giọng trong cài đặt. `available` = null khi chưa kiểm tra xong. */
export function useSpeech() {
  const rate = useSettings((s) => s.ttsRate);
  const voiceURI = useSettings((s) => s.voiceURI);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!isSpeechSupported()) setAvailable(false);
    else hasChineseVoice().then((ok) => alive && setAvailable(ok));
    return () => {
      alive = false;
    };
  }, []);

  const say = useCallback(
    async (text: string, opts: { pitch?: number; rate?: number } = {}) => {
      setSpeaking(true);
      await speak(text, { rate: opts.rate ?? rate, voiceURI, pitch: opts.pitch });
      setSpeaking(false);
    },
    [rate, voiceURI],
  );

  return { say, speaking, available };
}
