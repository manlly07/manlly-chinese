import { ChevronRight, PenLine, Play } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HanziWriterBox, type HanziWriterHandle } from "@/components/learning/HanziWriterBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StrokeData } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Một chữ ví dụ: bấm để xem lại hoạt ảnh thứ tự nét. */
function Demo({ char, size = 96 }: { char: string; size?: number }) {
  const ref = useRef<HanziWriterHandle>(null);
  return (
    <button type="button" onClick={() => ref.current?.animate()} aria-label={`Xem thứ tự nét chữ ${char}`} className="relative shrink-0 rounded-2xl">
      <HanziWriterBox ref={ref} char={char} size={size} autoAnimate />
      <Play className="absolute bottom-1 right-1 size-4 text-muted-foreground" aria-hidden />
    </button>
  );
}

/** Bước "Nét chữ": 8 nét cơ bản rồi 7 quy tắc thứ tự viết — mỗi mục có chữ ví dụ chạy hoạt ảnh. */
export function StrokesStep({ data, onDone }: { data: StrokeData; onDone: () => void }) {
  const [part, setPart] = useState<"strokes" | "rules">("strokes");
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="rounded-2xl bg-candy-yellow p-4 font-semibold text-candy-yellow-foreground">
        Mọi chữ Hán đều ghép từ vài loại nét cơ bản, viết theo vài quy tắc cố định. Nắm nét → nhận ra bộ → ghép thành chữ.
      </p>
      <div className="flex gap-2" role="tablist">
        {(["strokes", "rules"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={part === p}
            onClick={() => setPart(p)}
            className={cn("h-10 rounded-full px-4 text-sm font-black", part === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
          >
            {p === "strokes" ? `${data.strokes.length} nét cơ bản` : `${data.rules.length} quy tắc viết`}
          </button>
        ))}
      </div>

      {part === "strokes" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.strokes.map((s) => (
            <div key={s.name} className="flex items-center gap-3 rounded-2xl border-2 border-border/70 bg-card p-3">
              <span className="hanzi flex size-14 shrink-0 items-center justify-center rounded-2xl bg-candy-mint text-4xl text-candy-mint-foreground">{s.glyph}</span>
              <div className="min-w-0 flex-1">
                <p className="font-black">
                  {s.vi} <span className="hanzi font-normal">{s.name}</span> <span className="font-pinyin text-sm text-muted-foreground">{s.pinyin}</span>
                </p>
                <p className="text-sm font-semibold text-muted-foreground">{s.desc}</p>
              </div>
              <Demo char={s.example} size={72} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data.rules.map((r, i) => (
            <Card key={r.title}>
              <CardHeader className="pb-1">
                <CardTitle className="text-lg">
                  {i + 1}. {r.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <Demo char={r.example} />
                <div className="space-y-2">
                  <p className="font-semibold">{r.explain}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/hanzi/${encodeURIComponent(r.example)}?mode=trace`}>
                      <PenLine /> Tập viết {r.example}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-center text-sm font-bold text-muted-foreground">Bấm vào ô chữ để xem lại thứ tự nét</p>
      {part === "strokes" ? (
        <Button size="lg" className="w-full" onClick={() => setPart("rules")}>
          Sang quy tắc viết <ChevronRight />
        </Button>
      ) : (
        <Button size="lg" className="w-full" onClick={onDone}>
          Làm bài tập <ChevronRight />
        </Button>
      )}
    </div>
  );
}
