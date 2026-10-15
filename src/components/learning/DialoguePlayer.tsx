import { Eye, EyeOff, Languages, Pause, Play, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Chip } from "@/components/ui/chip";
import type { Dialogue } from "@/lib/content";
import { cn } from "@/lib/utils";
import { HanziText } from "./HanziText";
import { useSpeech } from "./use-speech";

interface Props {
  dialogue: Dialogue;
  /** chế độ nghe: mặc định ẩn chữ để luyện nghe trước */
  listeningMode?: boolean;
}

const BUBBLE = [
  "bg-candy-pink text-candy-pink-foreground",
  "bg-candy-sky text-candy-sky-foreground",
  "bg-candy-mint text-candy-mint-foreground",
  "bg-candy-yellow text-candy-yellow-foreground",
];
const PITCH = [1.15, 0.85, 1, 1.3];

/** Hội thoại dạng bong bóng chat; phát từng câu hoặc cả bài, bật/tắt chữ Hán, pinyin, bản dịch. */
export function DialoguePlayer({ dialogue, listeningMode = false }: Props) {
  const { say, available } = useSpeech();
  const [showHanzi, setShowHanzi] = useState(!listeningMode);
  const [showPinyin, setShowPinyin] = useState(!listeningMode);
  const [showVi, setShowVi] = useState(!listeningMode);
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const stop = useRef(false);

  const speakers = [...new Set(dialogue.lines.map((l) => l.speaker))];
  const idx = (s: string) => speakers.indexOf(s) % BUBBLE.length;
  const first = dialogue.lines[0]?.speaker;

  const playLine = async (i: number) => {
    setActive(i);
    const l = dialogue.lines[i];
    await say(l.zh, { pitch: PITCH[idx(l.speaker)] });
  };

  const playAll = async () => {
    if (playing) {
      stop.current = true;
      speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    stop.current = false;
    setPlaying(true);
    for (let i = 0; i < dialogue.lines.length && !stop.current; i++) {
      await playLine(i);
      await new Promise((r) => setTimeout(r, 350));
    }
    setPlaying(false);
    setActive(null);
  };

  useEffect(
    () => () => {
      stop.current = true;
    },
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void playAll()}
          disabled={available === false}
          className="btn-pop inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground disabled:opacity-50"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? "Dừng" : "Nghe cả bài"}
        </button>
        <Chip active={showHanzi} onClick={() => setShowHanzi((v) => !v)}>
          {showHanzi ? <Eye className="size-4" /> : <EyeOff className="size-4" />} Chữ Hán
        </Chip>
        <Chip active={showPinyin} onClick={() => setShowPinyin((v) => !v)}>
          <Type className="size-4" /> Pinyin
        </Chip>
        <Chip active={showVi} onClick={() => setShowVi((v) => !v)}>
          <Languages className="size-4" /> Dịch
        </Chip>
      </div>
      {available === false && <p className="text-sm font-semibold text-muted-foreground">Máy chưa có giọng đọc tiếng Trung — xem hướng dẫn trong Cài đặt.</p>}

      <ol className="space-y-3">
        {dialogue.lines.map((l, i) => {
          const mine = l.speaker !== first;
          const hidden = !showHanzi && !showPinyin && !showVi;
          return (
            <li key={i} className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
              <span className="px-2 text-xs font-black text-muted-foreground">{l.speaker}</span>
              <button
                type="button"
                onClick={() => void playLine(i)}
                aria-label={`Nghe câu ${i + 1}`}
                className={cn(
                  "max-w-[85%] rounded-3xl px-4 py-3 text-left shadow-soft transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  BUBBLE[idx(l.speaker)],
                  mine ? "rounded-br-md" : "rounded-bl-md",
                  active === i && "scale-[1.02] ring-2 ring-primary",
                )}
              >
                {hidden && <span className="font-bold">🔊 Câu {i + 1}</span>}
                {showHanzi && (
                  <HanziText variant="inline" className="block font-bold">
                    {l.zh}
                  </HanziText>
                )}
                {showPinyin && <span className="block font-pinyin text-sm font-semibold opacity-90">{l.py}</span>}
                {showVi && <span className="mt-0.5 block text-sm font-semibold text-foreground/80">{l.vi}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
