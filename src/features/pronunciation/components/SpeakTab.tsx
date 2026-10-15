import { Mic, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CuteIcon } from "@/components/learning/CuteIcon";
import { HanziText } from "@/components/learning/HanziText";
import { PinyinText } from "@/components/learning/PinyinText";
import { useSpeech } from "@/components/learning/use-speech";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { useVocab } from "@/hooks/use-vocab";
import { hanChars, loadDialogues, type DialogueLine, type PinyinData } from "@/lib/content";
import {
  classifyTone,
  contourMean,
  decodeToMono16k,
  pitchTrack,
  segmentSyllables,
  targetContour,
  userContour,
  type ContourPoint,
} from "@/lib/pitch";
import { sandhiTones, splitSyllables, type Tone, TONE_CLASS, TONE_NAMES } from "@/lib/pinyin";
import { pick } from "@/lib/random";
import { playSfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { useSettings } from "@/store/settings";
import { useRecorder } from "../use-recorder";
import { PitchChart } from "./PitchChart";

type Mode = "tone" | "word" | "sentence";
const MODES: { key: Mode; label: string; maxMs: number }[] = [
  { key: "tone", label: "Âm tiết", maxMs: 2500 },
  { key: "word", label: "Từ 2 chữ", maxMs: 3500 },
  { key: "sentence", label: "Câu ngắn", maxMs: 8000 },
];

interface Item {
  hanzi: string;
  pinyin: string;
  syllables: string[];
  /** thanh đọc thực tế (đã biến điệu) */
  tones: Tone[];
  vi?: string;
}

interface Analysis {
  user: ContourPoint[][];
  /** thanh ước lượng từng âm tiết — chỉ có ở chế độ âm tiết/từ */
  guesses: (Tone | null)[] | null;
  ok: boolean | null;
}

const isSyllable = (s: string) => /[a-züÀ-ɏ]/i.test(s);

function makeItem(hanzi: string, pinyin: string, vi?: string): Item {
  const syllables = pinyin.trim().split(/\s+/).flatMap(splitSyllables).filter(isSyllable);
  const chars = hanChars(hanzi);
  return { hanzi, pinyin, syllables, tones: sandhiTones(syllables, chars.length === syllables.length ? chars : undefined), vi };
}

/** Thanh 3 đứng trước âm tiết khác đọc "nửa thanh 3" (thấp, đi xuống) — chấp nhận cả kiểu xuống. */
const accepts = (target: Tone, guess: Tone | null, last: boolean) =>
  guess === target || (target === 3 && !last && guess === 4);

export function SpeakTab({ data }: { data: PinyinData }) {
  const [params] = useSearchParams();
  const { words } = useVocab();
  const cards = useProgress((s) => s.cards);
  const recordAnswer = useProgress((s) => s.recordAnswer);
  const sfxOn = useSettings((s) => s.soundEffects);
  const { say, available } = useSpeech();
  const [mode, setMode] = useState<Mode>(params.get("w") ? "word" : "tone");
  const [lines, setLines] = useState<DialogueLine[]>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const graded = useRef(false);
  const wantedUsed = useRef(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    void loadDialogues().then((ds) => setLines(ds.flatMap((d) => d.lines).filter((l) => hanChars(l.zh).length >= 3 && hanChars(l.zh).length <= 10)));
  }, []);

  // từ 2 chữ: ưu tiên từ đã học
  const pairWords = useMemo(() => {
    const two = words.filter((w) => w.pinyin.trim().split(/\s+/).length === 2 && hanChars(w.hanzi).length === 2);
    const learned = two.filter((w) => cards[w.id]);
    return learned.length >= 8 ? learned : two.filter((w) => w.hsk2 === 1);
  }, [words, cards]);

  const contourOf = useCallback((t: Tone) => data.tones.find((x) => x.tone === t)?.contour ?? [3], [data.tones]);

  const next = useCallback(() => {
    setAnalysis(null);
    graded.current = false;
    if (mode === "tone") {
      const set = pick(data.toneSets);
      const i = Math.floor(Math.random() * set.chars.length);
      setItem(makeItem(set.chars[i], set.pinyin[i]));
    } else if (mode === "word") {
      // từ được mở từ trang chi tiết (?w=) chỉ dùng cho lượt đầu
      const wanted = wantedUsed.current ? null : params.get("w");
      const fromLink = wanted ? words.find((x) => x.id === wanted) : undefined;
      if (fromLink) wantedUsed.current = true;
      const w = fromLink ?? (pairWords.length ? pick(pairWords) : null);
      setItem(w ? makeItem(w.hanzi, w.pinyin, w.meaning[0]) : null);
    } else {
      const l = lines.length ? pick(lines) : null;
      setItem(l ? makeItem(l.zh, l.py, l.vi) : null);
    }
    // chỉ chạy lại khi đổi chế độ hoặc dữ liệu vừa tải xong
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, data.toneSets, pairWords.length > 0, lines.length > 0, words.length > 0]);

  useEffect(() => {
    next();
  }, [next]);

  const target = useMemo(() => (item ? targetContour(item.tones, contourOf) : []), [item, contourOf]);

  const analyse = useCallback(
    async (blob: Blob) => {
      if (!item) return;
      try {
        const track = pitchTrack(await decodeToMono16k(blob));
        const user = userContour(track, contourMean(target), item.tones.length);
        if (!user.length) {
          setAnalysis({ user: [], guesses: null, ok: null });
          return;
        }
        let guesses: (Tone | null)[] | null = null;
        let ok: boolean | null = null;
        if (mode !== "sentence") {
          guesses = segmentSyllables(track, item.tones.length).map(classifyTone);
          const checked = item.tones.map((t, i) => (t === 5 ? null : accepts(t, guesses![i], i === item.tones.length - 1)));
          ok = checked.every((c) => c !== false);
          if (!graded.current) {
            graded.current = true;
            recordAnswer(ok);
            setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
          }
          if (sfxOn) playSfx(ok ? "correct" : "wrong");
        }
        setAnalysis({ user, guesses, ok });
      } catch {
        toast.error("Không phân tích được bản ghi — thử ghi lại nhé.");
      } finally {
        rec.done();
      }
    },
    // rec.done ổn định (useCallback trong useRecorder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item, target, mode, recordAnswer, sfxOn],
  );

  const maxMs = MODES.find((m) => m.key === mode)!.maxMs;
  const rec = useRecorder(maxMs, (b) => void analyse(b));

  // tự đánh giá cho câu (không chấm tự động được từng thanh)
  const selfGrade = (ok: boolean) => {
    if (graded.current) return;
    graded.current = true;
    recordAnswer(ok);
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
    next();
  };

  const playMine = () => {
    if (!rec.url) return;
    audio.current?.pause();
    audio.current = new Audio(rec.url);
    void audio.current.play();
  };

  const toggleRec = () => (rec.status === "recording" ? rec.stop() : void rec.start());

  // Phím: R nghe mẫu · Space ghi/dừng · P nghe lại giọng mình · Enter câu tiếp
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select, button")) return;
      const k = e.key.toLowerCase();
      if (k === "r" && item) void say(item.hanzi);
      else if (k === " ") {
        e.preventDefault();
        toggleRec();
      } else if (k === "p") playMine();
      else if (k === "enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => () => audio.current?.pause(), []);

  if (rec.status === "unsupported") {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <CuteIcon name="pronunciation" className="size-16" />
          <p className="font-black">Trình duyệt này chưa cho phép ghi âm</p>
          <p className="text-sm font-semibold text-muted-foreground">
            Hãy mở app bằng Chrome, Edge, Safari hoặc Firefox bản mới, qua địa chỉ <b>https://</b> (hoặc localhost).
          </p>
        </CardContent>
      </Card>
    );
  }

  const recording = rec.status === "recording";
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <Chip key={m.key} active={mode === m.key} onClick={() => setMode(m.key)}>
              {m.label}
            </Chip>
          ))}
        </div>
        {score.total > 0 && (
          <span className="rounded-full bg-candy-mint px-3 py-1 text-sm font-black text-candy-mint-foreground">
            Đạt {score.right}/{score.total}
          </span>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-5 p-5 sm:p-6">
          {!item ? (
            <p className="py-10 font-semibold text-muted-foreground">Đang chuẩn bị…</p>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1 text-center">
                <HanziText className={cn("font-bold", mode === "sentence" ? "text-3xl" : "text-6xl")}>{item.hanzi}</HanziText>
                <PinyinText pinyin={item.pinyin} hanzi={item.hanzi} sandhi className="text-xl" />
                {item.vi && <p className="text-sm font-semibold text-muted-foreground">{item.vi}</p>}
              </div>

              <PitchChart target={target} tones={item.tones} labels={item.syllables} user={analysis?.user ?? null} />

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-14 rounded-full"
                  onClick={() => void say(item.hanzi)}
                  disabled={available === false}
                  aria-label="Nghe mẫu (phím R)"
                  title="Nghe mẫu (R)"
                >
                  <Volume2 className="!size-7" />
                </Button>
                <button
                  type="button"
                  onClick={toggleRec}
                  disabled={rec.status === "processing"}
                  aria-label={recording ? "Dừng ghi âm (phím cách)" : "Bắt đầu ghi âm (phím cách)"}
                  aria-pressed={recording}
                  className={cn(
                    "btn-pop relative flex size-24 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:opacity-60",
                    recording
                      ? "bg-destructive text-destructive-foreground [--btn-shadow:var(--destructive-shadow)]"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {recording && (
                    <span
                      className="absolute inset-0 rounded-full bg-destructive/30 transition-transform"
                      style={{ transform: `scale(${1 + rec.level * 0.45})` }}
                      aria-hidden
                    />
                  )}
                  {recording ? <Square className="relative size-9 fill-current" /> : <Mic className="relative size-11" />}
                </button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-14 rounded-full"
                  onClick={playMine}
                  disabled={!rec.url || recording}
                  aria-label="Nghe lại giọng bạn (phím P)"
                  title="Nghe lại giọng bạn (P)"
                >
                  <Play className="!size-6" />
                </Button>
              </div>
              <p className="-mt-2 text-sm font-bold text-muted-foreground" aria-live="polite">
                {recording
                  ? "Đang nghe… nói to, rõ rồi bấm dừng"
                  : rec.status === "processing"
                    ? "Đang phân tích…"
                    : rec.status === "denied"
                      ? "Bạn chưa cho phép dùng micro — bấm biểu tượng ổ khoá trên thanh địa chỉ để bật"
                      : "Nghe mẫu → bấm micro → đọc theo"}
              </p>

              {analysis && <Feedback item={item} analysis={analysis} mode={mode} />}

              <div className="flex w-full flex-wrap justify-center gap-3">
                {mode === "sentence" && analysis?.user.length ? (
                  <>
                    <Button variant="outline" onClick={() => selfGrade(false)}>
                      Chưa giống lắm
                    </Button>
                    <Button onClick={() => selfGrade(true)}>Giống rồi!</Button>
                  </>
                ) : (
                  <Button variant={analysis ? "default" : "ghost"} onClick={next}>
                    <RotateCcw /> {analysis ? "Câu tiếp" : "Đổi câu khác"}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-xs font-semibold text-muted-foreground">
        R nghe mẫu · Phím cách ghi/dừng · P nghe lại giọng bạn · Enter câu tiếp
        <br />
        🔒 Bản ghi chỉ xử lý ngay trên máy bạn, không lưu và không gửi đi đâu.
      </p>
    </div>
  );
}

function Feedback({ item, analysis, mode }: { item: Item; analysis: Analysis; mode: Mode }) {
  if (!analysis.user.length) {
    return (
      <p className="w-full rounded-2xl bg-candy-yellow p-3 text-center font-bold text-candy-yellow-foreground">
        Chưa nghe rõ giọng bạn — thử nói to hơn, kéo dài âm và để micro gần miệng nhé.
      </p>
    );
  }
  if (mode === "sentence" || !analysis.guesses) {
    return (
      <p className="w-full rounded-2xl bg-candy-sky p-3 text-center text-sm font-bold text-candy-sky-foreground">
        So nét đậm với dải màu: lên xuống có giống không? Bấm ▶ để nghe lại giọng mình rồi tự đánh giá.
      </p>
    );
  }
  return (
    <div
      className={cn(
        "w-full space-y-2 rounded-2xl p-3 text-center",
        analysis.ok ? "bg-candy-mint text-candy-mint-foreground" : "bg-candy-pink text-candy-pink-foreground",
      )}
    >
      <p className="text-lg font-black">{analysis.ok ? "Chuẩn thanh rồi! 🎉" : "Gần được rồi, thử lại nhé!"}</p>
      <ul className="flex flex-wrap justify-center gap-2">
        {item.tones.map((t, i) => {
          const g = analysis.guesses![i];
          const good = t === 5 || accepts(t, g, i === item.tones.length - 1);
          return (
            <li key={i} className="rounded-xl bg-card px-3 py-1.5 text-sm font-bold text-foreground">
              <span className={cn("font-pinyin font-black", TONE_CLASS[t])}>{item.syllables[i]}</span>{" "}
              {t === 5 ? (
                "thanh nhẹ"
              ) : good ? (
                <>✓ {TONE_NAMES[t]}</>
              ) : (
                <>
                  nghe như {g ? TONE_NAMES[g] : "chưa rõ"} · cần <b className={TONE_CLASS[t]}>{TONE_NAMES[t]}</b>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs font-semibold opacity-80">Máy ước lượng theo đường cao độ, chỉ để tham khảo.</p>
    </div>
  );
}
