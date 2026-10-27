import { Minus, Plus, Printer, Trash2 } from "lucide-react";
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
import { buildWordPractice, DEFAULT_SKILLS, type PracticeSkill, practiceWords } from "@/lib/word-practice";
import { addWords, charMeta, fromWord, parseCustom, sheetChars, sheetPageCount } from "@/lib/worksheet";
import { useProgress } from "@/store/progress";
import { SavedWorksheets } from "./components/SavedWorksheets";
import { SortableWordList } from "./components/SortableWordList";
import { PracticeSession, PracticeSetup } from "./components/WordPractice";
import { WordPicker } from "./components/WordPicker";
import { WorksheetSheet } from "./components/WorksheetSheet";
import { useWorksheetDoc } from "./use-worksheet-doc";

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

const MAX_BLANK = 20;

/** Chọn số nguyên trong [min, max] bằng nút − / + hoặc gõ trực tiếp. */
function Stepper({ value, onChange, label, min, max, unit }: { value: number; onChange: (v: number) => void; label: string; min: number; max: number; unit: string }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Number.isFinite(v) ? Math.round(v) : min)));
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-black">{label}</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Bớt 1 ${unit}`}>
          <Minus />
        </Button>
        <Input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => set(e.target.valueAsNumber)}
          className="h-10 w-16 text-center font-bold"
          aria-label={label}
        />
        <Button variant="outline" size="icon" onClick={() => set(value + 1)} disabled={value >= max} aria-label={`Thêm 1 ${unit}`}>
          <Plus />
        </Button>
        <span className="text-sm font-semibold text-muted-foreground">{value ? `${unit} toàn ô trống` : "không thêm"}</span>
      </div>
    </div>
  );
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
  const [params, setParams] = useSearchParams();
  const { doc, setList, setTitle, setOptions, start, save, open, remove } = useWorksheetDoc();
  const { words: list, title, options } = doc;
  const savedMap = useProgress((s) => s.worksheets);
  const saved = useMemo(() => Object.values(savedMap), [savedMap]);
  const [strokes, setStrokes] = useState<Map<string, StrokeData | null>>(new Map());
  const [loadingStrokes, setLoadingStrokes] = useState(false);
  const [skills, setSkills] = useState<PracticeSkill[]>(DEFAULT_SKILLS);
  const [practicing, setPracticing] = useState(false);
  const printRoot = usePrintRoot();
  const { ref: previewRef, scale } = useFitScale();

  useEffect(() => {
    void loadLessons().then(setLessons);
  }, []);

  // mở từ bài học (?lesson=hsk1-01) hoặc từ danh sách chữ (?words=你好,老师) → vở mới chưa lưu;
  // xoá tham số khỏi URL để quay lại trang (nút Back) không tạo lại vở đè lên vở đang soạn
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || loading || !lessons.length) return;
    seeded.current = true;
    const l = lessons.find((x) => x.id === params.get("lesson"));
    const ws = params.get("words");
    if (l) {
      const byId = new Map(vocab.map((w) => [w.id, w]));
      start({ title: l.title, words: l.words.map((id) => byId.get(id)).filter((w) => !!w).map((w) => fromWord(w!)) });
    } else if (ws) start({ words: parseCustom(ws, vocab) });
    if (l || ws) setParams({}, { replace: true });
  }, [loading, lessons, vocab, params, start, setParams]);

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
  const practice = useMemo(() => practiceWords(list, vocab), [list, vocab]);

  if (loading) return <Skeleton className="h-96 rounded-lg" />;
  // luyện ngay trong trang (không đổi route) để quay lại vẫn còn nguyên danh sách từ
  if (practicing) return <PracticeSession build={() => buildWordPractice(practice.words, vocab, hp, skills)} onExit={() => setPracticing(false)} />;

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

      {/* minmax(0,…) + min-w-0: cột được co hẹp hơn nội dung (ô chọn bài dài) — không làm tràn ngang trên điện thoại */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Vở của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <SavedWorksheets doc={doc} saved={saved} onSave={save} onNew={() => start()} onOpen={open} onDelete={remove} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">1. Chọn từ</CardTitle>
            </CardHeader>
            <CardContent>
              <WordPicker
                vocab={vocab}
                lessons={lessons}
                added={new Set(list.map((w) => w.hanzi))}
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
                <>
                  <p className="text-xs font-semibold text-muted-foreground">Kéo ⋮⋮ để đổi thứ tự — các trang chữ trong vở xếp theo thứ tự này.</p>
                  <SortableWordList words={list} onChange={setList} />
                </>
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
              <Stepper
                label="Trang trắng cuối vở"
                unit="trang"
                min={0}
                max={MAX_BLANK}
                value={options.blankPages}
                onChange={(blankPages) => setOptions((o) => ({ ...o, blankPages }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">4. Luyện trên app</CardTitle>
              <p className="text-sm font-semibold text-muted-foreground">Làm bài tập với chính các từ trong vở — chấm ngay, câu sai vào Sổ lỗi sai.</p>
            </CardHeader>
            <CardContent>
              <PracticeSetup
                words={practice.words}
                skipped={practice.skipped}
                skills={skills}
                onSkills={setSkills}
                vocab={vocab}
                hp={hp}
                onStart={() => {
                  setPracticing(true);
                  window.scrollTo({ top: 0 });
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black">
              Xem trước · {list.length ? `${sheetPageCount(list.length, chars.length, options.blankPages)} trang A4` : "chưa có từ"}
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
