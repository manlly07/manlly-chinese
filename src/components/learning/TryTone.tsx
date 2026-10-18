import { Mic, Square } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { classifyTone, decodeToMono16k, pitchTrack, trimTrack } from "@/lib/pitch";
import { TONE_CLASS, TONE_NAMES, type Tone } from "@/lib/pinyin";
import { playSfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";
import { useSettings } from "@/store/settings";
import { useRecorder } from "./use-recorder";

interface Props {
  /** âm tiết có dấu cần đọc, vd "chā" */
  label: string;
  tone: Tone;
}

type Verdict = { ok: boolean; guess: Tone | null } | "silent";

/**
 * Đọc thử một âm tiết: ghi âm (tối đa 2,5 giây) → ước lượng thanh từ đường cao độ, ngay trên máy.
 * Bản ghi chỉ nằm trong bộ nhớ, không lưu, không gửi đi.
 */
export function TryTone({ label, tone }: Props) {
  const sfxOn = useSettings((s) => s.soundEffects);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const rec = useRecorder(2500, (blob) => void analyse(blob));
  const { done } = rec;

  const analyse = useCallback(
    async (blob: Blob) => {
      try {
        const track = trimTrack(pitchTrack(await decodeToMono16k(blob)));
        if (track.filter((x) => x !== null).length < 6) {
          setVerdict("silent");
          return;
        }
        const guess = classifyTone(track);
        const ok = guess === tone;
        setVerdict({ ok, guess });
        if (sfxOn) playSfx(ok ? "correct" : "wrong");
      } catch {
        setVerdict("silent");
      } finally {
        done();
      }
    },
    [tone, sfxOn, done],
  );

  if (rec.status === "unsupported") return null;
  const recording = rec.status === "recording";

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant={recording ? "destructive" : "secondary"}
        onClick={() => {
          if (recording) rec.stop();
          else {
            setVerdict(null);
            void rec.start();
          }
        }}
        disabled={rec.status === "processing"}
      >
        {recording ? <Square /> : <Mic />}
        {recording ? "Dừng" : (
          <>
            Đọc thử <span className={cn("font-pinyin font-black", TONE_CLASS[tone])}>{label}</span>
          </>
        )}
      </Button>
      {recording && (
        <span className="h-1.5 w-32 overflow-hidden rounded-full bg-muted" aria-hidden>
          <span className="block h-full bg-primary transition-all" style={{ width: `${Math.round(rec.level * 100)}%` }} />
        </span>
      )}
      {rec.status === "denied" && <p className="text-xs font-bold text-muted-foreground">Chưa được phép dùng micro — bật quyền micro cho trang này nhé.</p>}
      {verdict && (
        <p
          role="status"
          className={cn(
            "rounded-xl px-3 py-1.5 text-sm font-bold",
            verdict === "silent" ? "bg-muted" : verdict.ok ? "bg-candy-mint text-candy-mint-foreground" : "bg-candy-pink text-candy-pink-foreground",
          )}
        >
          {verdict === "silent"
            ? "Chưa nghe rõ — đọc to và kéo dài hơn một chút."
            : verdict.ok
              ? `Chuẩn ${TONE_NAMES[tone]}! 🎉`
              : `Nghe như ${verdict.guess ? TONE_NAMES[verdict.guess] : "chưa rõ thanh"} — nghe mẫu rồi thử lại`}
        </p>
      )}
    </div>
  );
}
