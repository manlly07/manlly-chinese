import { VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { VOICE_HELP } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { useSpeech } from "./use-speech";

/**
 * Cảnh báo khi máy chưa có giọng đọc tiếng Trung — phần nghe (pinyin, nghe hiểu) sẽ im lặng.
 * Không hiện gì khi có giọng hoặc đang kiểm tra.
 */
export function VoiceWarning({ className }: { className?: string }) {
  const { available } = useSpeech();
  if (available !== false) return null;
  return (
    <div role="alert" className={cn("space-y-2 rounded-2xl border-2 border-candy-pink-foreground/40 bg-candy-pink p-4 text-candy-pink-foreground", className)}>
      <p className="flex items-center gap-2 font-black">
        <VolumeX className="size-5 shrink-0" aria-hidden /> Máy chưa có giọng đọc tiếng Trung
      </p>
      <p className="text-sm font-semibold">
        Các câu “nghe và chọn” sẽ không phát ra tiếng. Cài giọng tiếng Trung (miễn phí, vài phút) rồi tải lại trang:
      </p>
      <details className="text-sm font-semibold">
        <summary className="cursor-pointer font-black">Xem cách cài</summary>
        <ul className="mt-2 space-y-1.5">
          {VOICE_HELP.map((h) => (
            <li key={h.platform}>
              <b>{h.platform}:</b> {h.steps}
            </li>
          ))}
        </ul>
      </details>
      <Link to="/settings" className="inline-block text-sm font-black underline">
        Mở Cài đặt giọng đọc
      </Link>
    </div>
  );
}
