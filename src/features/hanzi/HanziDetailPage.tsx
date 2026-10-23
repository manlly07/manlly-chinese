import { ArrowLeft, ChevronLeft, ChevronRight, Eye, PenLine, Play, Printer, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CharParts } from "@/components/learning/CharParts";
import { EmptyState } from "@/components/learning/EmptyState";
import { useHanziParts } from "@/components/learning/use-hanzi-parts";
import { HanziWriterBox, type HanziWriterHandle } from "@/components/learning/HanziWriterBox";
import { PinyinText } from "@/components/learning/PinyinText";
import { SpeakButton } from "@/components/learning/SpeakButton";
import { WordCard } from "@/components/learning/WordCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { useChars } from "./use-chars";

type Mode = "watch" | "trace" | "recall";

export default function HanziDetailPage() {
  const { char: raw = "" } = useParams();
  const char = decodeURIComponent(raw);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mode = (params.get("mode") ?? "watch") as Mode;
  const { index, list, loading } = useChars();
  const hp = useHanziParts();
  const recordAnswer = useProgress((s) => s.recordAnswer);
  const writer = useRef<HanziWriterHandle>(null);
  const [strokes, setStrokes] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [size, setSize] = useState(280);

  const info = index.get(char);
  const pos = list.findIndex((c) => c.char === char);

  useEffect(() => {
    const fit = () => setSize(Math.min(300, window.innerWidth - 64));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const begin = (m: Mode) => {
    setResult(null);
    setMistakes(0);
    if (m === "watch") writer.current?.animate();
    else writer.current?.quiz({ showOutline: m === "trace" });
  };

  // đổi chữ / chế độ → khởi động lại khi dữ liệu nét sẵn sàng
  useEffect(() => {
    setResult(null);
    setMistakes(0);
  }, [char, mode]);

  if (loading) return <Skeleton className="h-96 rounded-lg" />;
  if (!info)
    return <EmptyState title="Chưa có chữ này trong dữ liệu" mood="sleepy" action={<Button asChild><Link to="/hanzi">Về danh sách chữ</Link></Button>} />;

  const prev = list[pos - 1];
  const next = list[pos + 1];
  const go = (c: string) => navigate(`/hanzi/${encodeURIComponent(c)}${mode !== "watch" ? `?mode=${mode}` : ""}`, { replace: true });
  const hideChar = mode === "recall" && result === null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/hanzi">
            <ArrowLeft /> Chữ Hán
          </Link>
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" disabled={!prev} aria-label="Chữ trước" onClick={() => prev && go(prev.char)}>
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon" disabled={!next} aria-label="Chữ sau" onClick={() => next && go(next.char)}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Card className="mx-auto w-fit">
          <CardContent className="space-y-4 p-4">
            <Tabs value={mode} onValueChange={(v) => setParams(v === "watch" ? {} : { mode: v }, { replace: true })}>
              <TabsList className="w-full">
                <TabsTrigger value="watch" className="flex-1 gap-1">
                  <Eye className="size-4" /> Xem
                </TabsTrigger>
                <TabsTrigger value="trace" className="flex-1 gap-1">
                  <PenLine className="size-4" /> Tô
                </TabsTrigger>
                <TabsTrigger value="recall" className="flex-1 gap-1">
                  <Sparkles className="size-4" /> Nhớ
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <HanziWriterBox
                key={`${char}-${mode}`}
                ref={writer}
                char={char}
                size={size}
                autoAnimate={mode === "watch"}
                onLoad={(n) => {
                  setStrokes(n);
                  if (mode !== "watch") writer.current?.quiz({ showOutline: mode === "trace" });
                }}
                onMistake={() => setMistakes((m) => m + 1)}
                onQuizComplete={(m) => {
                  setResult(m);
                  recordAnswer(m <= 2);
                }}
              />
              {mode !== "watch" && result === null && (
                <span className="absolute right-2 top-2 rounded-full bg-candy-pink px-2 py-0.5 text-xs font-black text-candy-pink-foreground">
                  Sai {mistakes}
                </span>
              )}
            </div>

            {result !== null ? (
              <div className="space-y-2 text-center">
                <p className="text-lg font-black">{result === 0 ? "Hoàn hảo! 🎉" : result <= 2 ? "Tốt lắm! 👏" : "Cố lên, thử lại nhé 💪"}</p>
                <p className="text-sm font-semibold text-muted-foreground">Sai {result} nét</p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={() => begin(mode)}>
                    <RotateCcw /> Viết lại
                  </Button>
                  {next && <Button onClick={() => go(next.char)}>Chữ tiếp</Button>}
                </div>
              </div>
            ) : (
              <div className="flex justify-center gap-2">
                <Button variant="secondary" onClick={() => begin(mode)}>
                  {mode === "watch" ? <Play /> : <RotateCcw />}
                  {mode === "watch" ? "Xem lại" : "Bắt đầu lại"}
                </Button>
              </div>
            )}
            {mode !== "watch" && result === null && (
              <p className="max-w-[18rem] text-center text-xs font-semibold text-muted-foreground">
                {mode === "trace" ? "Viết đè lên nét mờ theo đúng thứ tự." : "Viết từ trí nhớ — sai 2 lần sẽ có gợi ý."}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-4">
                <span lang="zh-CN" className={cn("hanzi text-7xl leading-none", hideChar && "blur-md")} aria-hidden={hideChar}>
                  {char}
                </span>
                <div className="flex-1 space-y-1">
                  <p className="text-xl">
                    {info.pinyin.map((p, i) => (
                      <span key={p}>
                        {i > 0 && <span className="text-muted-foreground"> / </span>}
                        <PinyinText pinyin={p} className="font-black" />
                      </span>
                    ))}
                  </p>
                  {info.hanViet.length > 0 && <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{info.hanViet.join(" / ")}</p>}
                  <p className="text-sm font-semibold text-muted-foreground">
                    HSK {info.level}
                    {strokes !== null && ` · ${strokes} nét`}
                  </p>
                </div>
                <SpeakButton text={info.words.find((w) => w.hanzi === char)?.hanzi ?? info.words[0]?.hanzi ?? char} />
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/worksheet?words=${encodeURIComponent(char)}`} aria-label={`In vở tập viết chữ ${char}`} title="In vở tập viết">
                    <Printer />
                  </Link>
                </Button>
              </div>
              {mode === "recall" && (
                <p className="rounded-2xl bg-candy-yellow p-3 font-bold text-candy-yellow-foreground">
                  Gợi ý: chữ trong từ “{info.words[0]?.meaning[0]}”
                </p>
              )}
              {hp && !hideChar && (
                <div className="space-y-1.5 border-t border-border/70 pt-3">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Cấu tạo chữ</p>
                  <CharParts char={char} hp={hp} />
                  {(() => {
                    const e = hp.chars.get(char);
                    const sem = e?.semantic && hp.info.get(e.semantic);
                    const pho = e?.phonetic && hp.info.get(e.phonetic);
                    return sem || pho ? (
                      <p className="text-sm font-semibold text-muted-foreground">
                        Chữ hình thanh: {sem && <>bộ <span className="hanzi">{e!.semantic}</span> gợi nghĩa “{sem.meaning}”</>}
                        {sem && pho && ", "}
                        {e?.phonetic && <>phần <span className="hanzi">{e.phonetic}</span> gợi cách đọc</>}.
                      </p>
                    ) : null;
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="font-black">Từ có chữ {hideChar ? "này" : char}</h2>
            <div className={cn("grid gap-3", hideChar && "pointer-events-none select-none blur-sm")}>
              {info.words.slice(0, 8).map((w) => (
                <WordCard key={w.id} word={w} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
