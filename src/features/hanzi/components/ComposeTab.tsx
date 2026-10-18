import { Eraser, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CharParts } from "@/components/learning/CharParts";
import { SpeakButton } from "@/components/learning/SpeakButton";
import { useHanziParts } from "@/components/learning/use-hanzi-parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CharInfo } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Bộ hay gặp (≥ COMMON chữ) lên trước, phần còn lại thu gọn. */
const COMMON = 3;

const sameParts = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

/**
 * Bảng ghép chữ: chọn bộ → xem "gia đình chữ" chứa bộ đó; chọn hai bộ → ra chữ ghép được.
 * Chữ hình thanh ghi rõ phần gợi nghĩa / gợi âm — mẹo nhớ chữ và đoán cách đọc.
 */
export function ComposeTab({ index }: { index: Map<string, CharInfo> }) {
  const hp = useHanziParts();
  const [sel, setSel] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const palette = useMemo(() => {
    if (!hp) return [];
    return [...hp.teach].filter((p) => (hp.freq.get(p) ?? 0) > 0).sort((a, b) => (hp.freq.get(b) ?? 0) - (hp.freq.get(a) ?? 0));
  }, [hp]);

  const results = useMemo(() => {
    if (!hp || !sel.length) return [];
    return [...hp.chars.values()].filter((e) => sel.every((p) => e.parts.includes(p)));
  }, [hp, sel]);

  if (!hp) return <Skeleton className="h-96 rounded-lg" />;

  const exact = sel.length === 2 ? results.filter((e) => sameParts(e.parts, sel)) : [];
  const soundFamily = sel.length === 1 ? results.filter((e) => e.phonetic === sel[0]) : [];
  const common = palette.filter((p) => (hp.freq.get(p) ?? 0) >= COMMON);
  const shown = showAll ? palette : common;

  const toggle = (p: string) =>
    setSel((s) => (s.includes(p) ? s.filter((x) => x !== p) : s.length >= 2 ? [s[0], p] : [...s, p]));

  const slot = (i: number) => {
    const p = sel[i];
    const info = p ? hp.info.get(p) : undefined;
    return (
      <button
        type="button"
        onClick={() => p && toggle(p)}
        aria-label={p ? `Bỏ ${p}` : `Ô ${i + 1} trống`}
        className={cn(
          "flex size-24 flex-col items-center justify-center rounded-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          p ? (i === 0 ? "bg-candy-sky text-candy-sky-foreground" : "bg-candy-pink text-candy-pink-foreground") : "border-2 border-dashed border-border text-muted-foreground",
        )}
      >
        <span className="hanzi text-5xl leading-none">{p ?? "?"}</span>
        {info?.hanViet && <span className="mt-1 text-[11px] font-black uppercase">{info.hanViet}</span>}
      </button>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <p className="font-semibold text-muted-foreground">
          Chữ Hán được ghép từ các bộ. Chọn một bộ để xem những chữ có chứa nó, chọn hai bộ để thử ghép thành chữ.
        </p>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-center gap-3" aria-live="polite">
              {slot(0)}
              <Plus className="size-6 text-muted-foreground" aria-hidden />
              {slot(1)}
              <span className="text-2xl font-black text-muted-foreground">=</span>
              {exact.length ? (
                exact.map((e) => (
                  <Link
                    key={e.char}
                    to={`/hanzi/${encodeURIComponent(e.char)}`}
                    className="hanzi flex size-24 items-center justify-center rounded-2xl bg-candy-yellow text-6xl text-candy-yellow-foreground transition-transform hover:-translate-y-0.5"
                  >
                    {e.char}
                  </Link>
                ))
              ) : (
                <span className="flex size-24 items-center justify-center rounded-2xl bg-muted text-sm font-bold text-muted-foreground">
                  {sel.length === 2 ? "Chưa có chữ" : "…"}
                </span>
              )}
            </div>
            {sel.length === 2 && !exact.length && (
              <p className="text-center text-sm font-bold text-muted-foreground">
                Hai bộ này không ghép thành chữ nào trong từ vựng đã có{results.length ? " — nhưng có chữ chứa cả hai, xem bên dưới." : "."}
              </p>
            )}
            {sel.length > 0 && (
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={() => setSel([])}>
                  <Eraser /> Xoá chọn
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <section className="space-y-2">
          <h2 className="font-black">Bộ {showAll ? `(${palette.length})` : "hay gặp"}</h2>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {shown.map((p) => {
              const info = hp.info.get(p);
              const on = sel.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggle(p)}
                  aria-pressed={on}
                  title={info ? `${info.hanViet} — ${info.meaning}` : undefined}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-2xl border-2 bg-card transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    on ? "border-primary bg-candy-mint text-candy-mint-foreground" : "border-border/70",
                  )}
                >
                  <span className="hanzi text-2xl leading-none">{p}</span>
                  <span className="mt-0.5 max-w-full truncate px-1 text-[10px] font-black uppercase">{info?.hanViet || info?.meaning}</span>
                </button>
              );
            })}
          </div>
          {palette.length > common.length && (
            <Button variant="outline" size="sm" onClick={() => setShowAll((x) => !x)}>
              {showAll ? "Chỉ hiện bộ hay gặp" : `Xem thêm ${palette.length - common.length} bộ`}
            </Button>
          )}
        </section>
      </div>

      <Card className="h-fit lg:sticky lg:top-20">
        <CardContent className="space-y-3 p-5">
          {!sel.length ? (
            <p className="text-sm font-semibold text-muted-foreground">
              Mẹo: bộ <span className="hanzi">口</span> (miệng) hay có trong chữ chỉ việc nói, ăn; <span className="hanzi">氵</span> (nước) trong chữ về nước.
              Còn phần kia của chữ thường gợi cách đọc: <span className="hanzi">马</span> mǎ → <span className="hanzi">吗 妈 骂</span> đều đọc gần “ma”.
            </p>
          ) : (
            <>
              {sel.length === 1 && (
                <div className="space-y-1">
                  <p className="text-lg font-black">
                    <span className="hanzi">{sel[0]}</span> {hp.info.get(sel[0])?.hanViet && <span className="uppercase">{hp.info.get(sel[0])!.hanViet} · </span>}
                    {hp.info.get(sel[0])?.meaning}
                  </p>
                  {hp.info.get(sel[0])?.note && <p className="text-sm font-semibold text-muted-foreground">{hp.info.get(sel[0])!.note}</p>}
                </div>
              )}
              {soundFamily.length >= 2 && (
                <p className="rounded-2xl bg-candy-yellow p-3 text-sm font-bold text-candy-yellow-foreground">
                  🔊 <span className="hanzi">{sel[0]}</span> gợi âm cho:{" "}
                  {soundFamily.map((e) => `${e.char} ${index.get(e.char)?.pinyin[0] ?? ""}`).join(" · ")}
                </p>
              )}
              <p className="text-sm font-black">
                {results.length ? `${results.length} chữ có chứa ${sel.join(" + ")}` : "Chưa có chữ nào trong từ vựng chứa các bộ này"}
              </p>
              <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                {results.map((e) => {
                  const ci = index.get(e.char);
                  return (
                    <li key={e.char} className="flex items-center gap-2 rounded-2xl bg-muted/60 p-2">
                      <Link to={`/hanzi/${encodeURIComponent(e.char)}`} className="min-w-0 flex-1 space-y-0.5">
                        <CharParts char={e.char} hp={hp} compact highlight={new Set(sel)} />
                        <span className="block pl-1 text-xs font-bold text-muted-foreground">
                          <span className="font-pinyin">{ci?.pinyin.join(", ")}</span>
                          {ci?.hanViet[0] && ` · ${ci.hanViet[0].toUpperCase()}`}
                          {ci?.words[0] && ` · ${ci.words[0].hanzi}: ${ci.words[0].meaning[0]}`}
                        </span>
                      </Link>
                      <SpeakButton text={ci?.words.find((w) => w.hanzi === e.char)?.hanzi ?? ci?.words[0]?.hanzi ?? e.char} />
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
