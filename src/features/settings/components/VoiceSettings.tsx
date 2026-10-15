import { useEffect, useState } from "react";
import { SpeakButton } from "@/components/learning/SpeakButton";
import { getChineseVoices, isSpeechSupported, VOICE_HELP } from "@/lib/speech";
import { useSettings } from "@/store/settings";
import { SettingRow, selectClass } from "./SettingRow";

export function VoiceSettings() {
  const rate = useSettings((s) => s.ttsRate);
  const voiceURI = useSettings((s) => s.voiceURI);
  const set = useSettings((s) => s.set);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[] | null>(null);

  useEffect(() => {
    void getChineseVoices().then(setVoices);
  }, []);

  return (
    <>
      <SettingRow label="Giọng đọc" htmlFor="voice">
        {voices?.length ? (
          <select id="voice" className={selectClass} value={voiceURI ?? ""} onChange={(e) => set({ voiceURI: e.target.value || undefined })}>
            <option value="">Tự chọn</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-muted-foreground">{voices === null ? "Đang kiểm tra…" : "Chưa có"}</span>
        )}
      </SettingRow>
      <SettingRow label={`Tốc độ đọc: ${rate.toLocaleString("vi-VN")}×`} htmlFor="rate">
        <div className="flex items-center gap-2">
          <input
            id="rate"
            type="range"
            min={0.5}
            max={1.3}
            step={0.1}
            value={rate}
            onChange={(e) => set({ ttsRate: Number(e.target.value) })}
            className="w-32 accent-[hsl(var(--primary))]"
          />
          <SpeakButton text="我在学习汉语。" label="Nghe thử" />
        </div>
      </SettingRow>
      {voices !== null && voices.length === 0 && (
        <div className="rounded-md bg-accent p-4 text-sm text-accent-foreground">
          <p className="font-medium">
            {isSpeechSupported() ? "Máy bạn chưa có giọng đọc tiếng Trung." : "Trình duyệt này không hỗ trợ đọc văn bản."}
          </p>
          {isSpeechSupported() && (
            <ul className="mt-2 space-y-1">
              {VOICE_HELP.map((h) => (
                <li key={h.platform}>
                  <b>{h.platform}:</b> {h.steps}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2">Sau khi cài, hãy tải lại trang.</p>
        </div>
      )}
    </>
  );
}
