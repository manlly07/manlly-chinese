import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { loadRadicals, type Radical } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Bộ thủ thường gặp: nghĩa + Hán Việt, chạm để xem chữ ví dụ. */
export function RadicalsTab() {
  const [items, setItems] = useState<Radical[] | null>(null);
  const [sel, setSel] = useState<Radical | null>(null);
  useEffect(() => {
    void loadRadicals().then((r) => {
      setItems(r);
      setSel(r[0]);
    });
  }, []);
  if (!items) return <Skeleton className="h-96 rounded-lg" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-3">
        <p className="font-semibold text-muted-foreground">
          Bộ thủ là “phần gợi nghĩa” của chữ: thấy 氵 là đoán liên quan đến nước, 口 liên quan đến miệng. Biết bộ thủ giúp nhớ chữ nhanh hơn nhiều.
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {items.map((r) => (
            <button
              key={r.radical}
              type="button"
              onClick={() => setSel(r)}
              aria-pressed={sel?.radical === r.radical}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-2xl border-2 bg-card transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                sel?.radical === r.radical ? "border-primary bg-candy-pink text-candy-pink-foreground" : "border-border/70",
              )}
            >
              <span lang="zh-CN" className="hanzi text-3xl leading-none">
                {r.radical}
              </span>
              <span className="mt-1 text-[11px] font-black uppercase">{r.hanViet}</span>
            </button>
          ))}
        </div>
      </div>
      {sel && (
        <Card className="h-fit lg:sticky lg:top-20">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-4">
              <span lang="zh-CN" className="hanzi flex size-20 items-center justify-center rounded-2xl bg-candy-yellow text-5xl text-candy-yellow-foreground">
                {sel.radical}
              </span>
              <div>
                <p className="text-lg font-black uppercase">{sel.hanViet}</p>
                <p className="font-semibold">{sel.meaning}</p>
                <p className="text-sm font-semibold text-muted-foreground">
                  {sel.strokes} nét{sel.variantOf && ` · dạng biến thể của ${sel.variantOf}`}
                </p>
              </div>
            </div>
            <p className="text-sm font-black">Chữ có bộ này</p>
            <div className="flex flex-wrap gap-2">
              {sel.examples.map((c) => (
                <Link
                  key={c}
                  to={`/hanzi/${encodeURIComponent(c)}`}
                  lang="zh-CN"
                  className="hanzi flex size-12 items-center justify-center rounded-xl bg-muted text-2xl transition-colors hover:bg-accent"
                >
                  {c}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
