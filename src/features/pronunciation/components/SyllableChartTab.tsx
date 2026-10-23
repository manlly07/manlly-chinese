import { Fragment, useEffect, useMemo, useState } from "react";
import { SyllableTones } from "@/components/learning/SyllableTones";
import { useSyllablePlayer } from "@/components/learning/use-syllable-player";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { loadSyllables, type PinyinData, type Syllable } from "@/lib/content";
import { TONE_CLASS, type Tone } from "@/lib/pinyin";
import { canPlay, indexSyllables, spellNote, syllableKey, tonesOf, withTone } from "@/lib/syllables";
import { cn } from "@/lib/utils";

/** Cột phụ âm đầu theo nhóm cách phát âm; "" = không có phụ âm đầu (viết y/w). */
const INITIAL_GROUPS: { label: string; items: string[] }[] = [
  { label: "", items: [""] },
  { label: "Môi", items: ["b", "p", "m", "f"] },
  { label: "Đầu lưỡi", items: ["d", "t", "n", "l"] },
  { label: "Cuống lưỡi", items: ["g", "k", "h"] },
  { label: "Mặt lưỡi", items: ["j", "q", "x"] },
  { label: "Uốn lưỡi", items: ["zh", "ch", "sh", "r"] },
  { label: "Đầu lưỡi trước", items: ["z", "c", "s"] },
];
const INITIALS = INITIAL_GROUPS.flatMap((g) => g.items);
const GROUP_START = new Set(INITIAL_GROUPS.map((g) => g.items[0]));

/**
 * Bảng âm tiết đầy đủ (kiểu bảng pinyin của các khoá học): hàng = vần, cột = phụ âm đầu.
 * Bấm ô để nghe thanh đang chọn bằng giọng người thật; ô trống = tổ hợp không tồn tại.
 */
export function SyllableChartTab({ data }: { data: PinyinData }) {
  const [syllables, setSyllables] = useState<Syllable[] | null>(null);
  const [sel, setSel] = useState<Syllable | null>(null);
  const [tone, setTone] = useState<Tone>(1);
  const play = useSyllablePlayer();
  useEffect(() => {
    void loadSyllables().then((s) => {
      setSyllables(s);
      setSel(s.find((x) => x.s === "cha") ?? s[0]);
    });
  }, []);
  const index = useMemo(() => indexSyllables(syllables ?? []), [syllables]);
  const groups = useMemo(() => [...new Set(data.finals.map((f) => f.group ?? ""))], [data.finals]);

  if (!syllables) return <Skeleton className="h-96 rounded-lg" />;

  const choose = (s: Syllable) => {
    setSel(s);
    // ô không có thanh đang chọn → phát thanh gần nhất có được
    const t = canPlay(s, tone) ? tone : tonesOf(s)[0];
    if (t) void play(s, t);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      {/* Ô đang chọn — dính trên cùng (mobile) / cột phải (desktop) để luôn thấy khi cuộn bảng */}
      <Card className="sticky top-2 z-30 h-fit lg:order-2 lg:top-20">
        <CardContent className="space-y-3 p-4">
          {sel && (
            <>
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-pinyin text-4xl font-black text-primary">{sel.s}</p>
                <p className="font-pinyin text-sm font-black text-muted-foreground">
                  {sel.i || "∅"} + {sel.f}
                </p>
              </div>
              {spellNote(sel.i, sel.f) && <p className="text-xs font-bold text-candy-yellow-foreground">💡 {spellNote(sel.i, sel.f)}</p>}
              <SyllableTones key={sel.s} syl={sel} tone={tone} onTone={setTone} />
            </>
          )}
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-3 lg:order-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-black text-muted-foreground">Bấm ô để nghe thanh</span>
          {([1, 2, 3, 4] as Tone[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              aria-pressed={tone === t}
              className={cn(
                "min-h-10 min-w-12 rounded-full border-2 px-3 font-pinyin text-lg font-black transition-colors",
                tone === t ? "border-primary bg-primary text-primary-foreground" : cn("border-border/70 bg-card", TONE_CLASS[t]),
              )}
            >
              {withTone({ s: "a", i: "", f: "a", t: [] }, t)}
            </button>
          ))}
        </div>

        <div className="max-h-[65vh] overflow-auto rounded-2xl border border-border/70 bg-card shadow-soft">
          <table className="border-separate border-spacing-0 text-center">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 bg-card" />
                {INITIAL_GROUPS.flatMap((g) =>
                  g.items.map((ini, k) => (
                    <th
                      key={ini || "zero"}
                      scope="col"
                      title={g.label ? `Nhóm ${g.label.toLowerCase()}` : "Không có phụ âm đầu"}
                      className={cn(
                        "sticky top-0 z-10 border-b border-border/50 bg-candy-sky px-1 py-1.5 font-pinyin text-base font-black text-candy-sky-foreground",
                        k === 0 && "border-l-2 border-l-candy-sky-foreground/30",
                      )}
                    >
                      {ini || "∅"}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <Fragment key={g}>
                  <tr>
                    <th colSpan={INITIALS.length + 1} className="sticky left-0 bg-background px-2 py-1 text-left text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                      Vần {g}
                    </th>
                  </tr>
                  {data.finals
                    .filter((f) => (f.group ?? "") === g)
                    .map((f) => (
                      <tr key={f.py}>
                        <th scope="row" className="sticky left-0 z-10 border-r border-border/50 bg-candy-pink px-2 py-1 font-pinyin text-base font-black text-candy-pink-foreground">
                          {f.py}
                        </th>
                        {INITIALS.map((ini) => {
                          const s = index.get(syllableKey(ini, f.py));
                          if (!s) return <td key={ini || "zero"} className={cn("border-b border-border/30", GROUP_START.has(ini) && "border-l-2 border-l-candy-sky-foreground/15")} />;
                          const on = sel?.s === s.s;
                          return (
                            <td key={ini || "zero"} className={cn("border-b border-border/30 p-0.5", GROUP_START.has(ini) && "border-l-2 border-l-candy-sky-foreground/15")}>
                              <button
                                type="button"
                                onClick={() => choose(s)}
                                aria-pressed={on}
                                aria-label={`${s.s} (${ini || "không phụ âm đầu"} + ${f.py})`}
                                className={cn(
                                  "min-h-9 min-w-12 rounded-lg px-1.5 font-pinyin text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  on ? "bg-primary text-primary-foreground" : "hover:bg-candy-yellow hover:text-candy-yellow-foreground",
                                )}
                              >
                                {s.s}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs font-semibold text-muted-foreground">
          {syllables.length} âm tiết · Ô trống = tiếng Trung phổ thông không có tổ hợp đó · ∅ = không có phụ âm đầu (viết với y/w) · Âm thanh: giọng đọc
          người bản ngữ từ dự án mở audio-cmn (CC BY-SA).
        </p>
      </div>
    </div>
  );
}
