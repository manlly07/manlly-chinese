import { Printer, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/learning/EmptyState";
import { useHanziParts } from "@/components/learning/use-hanzi-parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useVocab } from "@/hooks/use-vocab";
import { buildCharIndex, type Lesson, loadLessons } from "@/lib/content";
import { loadStrokeMap, type StrokeData } from "@/lib/stroke-data";
import { cn } from "@/lib/utils";
import { addWords, charMeta, fromWord, parseCustom, sheetChars, type SheetWord } from "@/lib/worksheet";
import { WordPicker } from "./components/WordPicker";
import { type SheetOptions, WorksheetSheet } from "./components/WorksheetSheet";

const PAGE_PX = 794; // 210 mm ở 96 dpi

/** Vùng in gắn thẳng vào <body> để CSS in ẩn được toàn bộ phần còn lại của app. */
function usePrintRoot() {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const div = document.createElement("div");
    div.id = "worksheet-print";
    document.body.appendChild(div);
    setEl(div);
    return () => div.remove();
  }, []);
  return el;
}

/** Thu nhỏ bản xem trước khổ A4 cho vừa bề ngang màn hình. */
function useFitScale() {
  // callback ref: phần tử chỉ xuất hiện sau khi tải xong dữ liệu
  const [el, ref] = useState<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / PAGE_PX)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return { ref, scale };
}

function Toggle<T extends string | number>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-black">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([v, text]) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={cn("min-h-10 rounded-full px-3 text-sm font-bold transition-colors", value === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70")}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Vở tập viết: chọn từ → xem trước → in A4 (hoặc lưu PDF). Mỗi chữ một trang: thứ tự nét, chữ to, chữ nhỏ. */
export default function WorksheetPage() {
  const { words: vocab, loading } = useVocab();
  const hp = useHanziParts();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [params] = useSearchParams();
  const [list, setList] = useState<SheetWord[]>([]);
  const [title, setTitle] = useState("Bài luyện viết");
  const [options, setOptions] = useState<SheetOptions>({ grid: "mi", traceStyle: "fill", bigRows: 3, bigTrace: 2, smallRows: 5, smallTrace: 3 });
  const [strokes, setStrokes] = useState<Map<string, StrokeData | null>>(new Map());
  const [loadingStrokes, setLoadingStrokes] = useState(false);
  const printRoot = usePrintRoot();
  const { ref: previewRef, scale } = useFitScale();

  useEffect(() => {
    void loadLessons().then(setLessons);
  }, []);

  // mở từ bài học (?lesson=hsk1-01) hoặc từ danh sách chữ (?words=你好,老师)
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || loading || !lessons.length) return;
    seeded.current = true;
    const l = lessons.find((x) => x.id === params.get("lesson"));
    if (l) {
      const byId = new Map(vocab.map((w) => [w.id, w]));
      setList(l.words.map((id) => byId.get(id)).filter((w) => !!w).map((w) => fromWord(w!)));
      setTitle(`HSK ${l.level} · Bài ${l.id.slice(-2)} · ${l.title}`);
    } else if (params.get("words")) {
      setList(parseCustom(params.get("words")!, vocab));
    }
  }, [loading, lessons, vocab, params]);

  const chars = useMemo(() => sheetChars(list), [list]);
  useEffect(() => {
    if (!chars.length) return;
    let alive = true;
    setLoadingStrokes(true);
    void loadStrokeMap(chars).then((m) => {
      if (!alive) return;
      setStrokes(m);
      setLoadingStrokes(false);
    });
    return () => {
      alive = false;
    };
  }, [chars]);

  const index = useMemo(() => buildCharIndex(vocab), [vocab]);
  const metas = useMemo(() => chars.map((c) => charMeta(c, list, index, vocab, hp)), [chars, list, index, vocab, hp]);
  const offline = chars.filter((c) => strokes.has(c) && !strokes.get(c));

  if (loading) return <Skeleton className="h-96 rounded-lg" />;

  const update = (i: number, patch: Partial<SheetWord>) => setList((l) => l.map((w, k) => (k === i ? { ...w, ...patch } : w)));
  const sheet = <WorksheetSheet title={title} words={list} chars={metas} strokes={strokes} options={options} />;

  return (
    <div className="space-y-5">
      <PageHeader
        icon="note"
        title="Vở tập viết"
        description="Chọn từ muốn học → in ra giấy: bảng từ mới, thứ tự nét, chữ to và chữ nhỏ để tô theo rồi tự viết"
        actions={
          <Button size="lg" disabled={!list.length || loadingStrokes} onClick={() => window.print()}>
            <Printer /> In / Lưu PDF
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">1. Chọn từ</CardTitle>
            </CardHeader>
            <CardContent>
              <WordPicker
                vocab={vocab}
                lessons={lessons}
                onAdd={(ws, t) => {
                  setList((l) => addWords(l, ws));
                  if (t && !list.length) setTitle(t);
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">2. Từ đã chọn ({list.length})</CardTitle>
              {list.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setList([])}>
                  <Trash2 /> Xoá hết
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="block space-y-1">
                <span className="text-sm font-black">Tiêu đề vở</span>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-10" />
              </label>
              {!list.length ? (
                <p className="text-sm font-semibold text-muted-foreground">Chưa có từ nào — thêm từ ở bước 1.</p>
              ) : (
                <ul className="space-y-2">
                  {list.map((w, i) => (
                    <li key={w.hanzi} className="flex items-start gap-2 rounded-2xl bg-muted/60 p-2">
                      <span className="hanzi w-14 shrink-0 pt-1 text-center text-2xl">{w.hanzi}</span>
                      <div className="grid min-w-0 flex-1 gap-1">
                        <Input value={w.pinyin} onChange={(e) => update(i, { pinyin: e.target.value })} placeholder="pinyin (nǐ hǎo)" className="font-pinyin h-8 text-sm" aria-label={`Pinyin của ${w.hanzi}`} />
                        <Input value={w.meaning} onChange={(e) => update(i, { meaning: e.target.value })} placeholder="nghĩa tiếng Việt" className="h-8 text-sm" aria-label={`Nghĩa của ${w.hanzi}`} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setList((l) => l.filter((_, k) => k !== i))} aria-label={`Bỏ ${w.hanzi}`}>
                        <X />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">3. Kiểu vở</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle label="Ô kẻ" value={options.grid} onChange={(grid) => setOptions((o) => ({ ...o, grid }))} options={[["mi", "米 chéo"], ["tian", "田 ô vuông"]]} />
              <Toggle
                label="Chữ mờ để tô"
                value={options.traceStyle}
                onChange={(traceStyle) => setOptions((o) => ({ ...o, traceStyle }))}
                options={[["fill", "Tô màu nhạt"], ["dashed", "Viền nét đứt"]]}
              />
              <Toggle
                label="Chữ to"
                value={options.bigRows}
                onChange={(bigRows) => setOptions((o) => ({ ...o, bigRows, bigTrace: bigRows - 1 }))}
                options={[[3, "3 dòng (2 tô · 1 tự viết)"], [2, "2 dòng (1 tô · 1 tự viết)"]]}
              />
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black">
              Xem trước · {list.length ? `${chars.length + 1} trang A4` : "chưa có từ"}
              {loadingStrokes && <span className="ml-2 text-sm font-semibold text-muted-foreground">đang tải thứ tự nét…</span>}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">Khi in: chọn khổ A4, tỉ lệ 100%; muốn có file thì chọn “Lưu dưới dạng PDF”.</p>
          </div>
          {offline.length > 0 && (
            <p className="rounded-2xl bg-candy-yellow p-3 text-sm font-bold text-candy-yellow-foreground">
              Chưa tải được thứ tự nét của {offline.join(" ")} (cần mạng) — các chữ này vẫn in được nhưng không có hàng thứ tự nét.
            </p>
          )}
          <div ref={previewRef} className="overflow-hidden rounded-lg">
            {!list.length ? (
              <EmptyState title="Chọn từ để tạo vở" mood="sleepy">
                Thêm cả một bài học, tìm từ, hoặc tự gõ chữ Hán bạn muốn luyện.
              </EmptyState>
            ) : (
              // zoom thu nhỏ cả bố cục (khác transform) nên chiều cao trang tự co theo
              <div style={{ width: PAGE_PX, zoom: scale }}>{sheet}</div>
            )}
          </div>
        </div>
      </div>

      {printRoot && list.length > 0 && createPortal(sheet, printRoot)}
    </div>
  );
}
