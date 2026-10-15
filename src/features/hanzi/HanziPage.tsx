import { PenLine, Search, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pinyinKey } from "@/lib/pinyin";
import { pick } from "@/lib/random";
import { foldVi } from "@/lib/search";
import { cn } from "@/lib/utils";
import { useSettings } from "@/store/settings";
import { RadicalsTab } from "./components/RadicalsTab";
import { useChars } from "./use-chars";

export default function HanziPage() {
  const { list, loading } = useChars();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const showHanViet = useSettings((s) => s.showHanViet);
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "chars";

  const filtered = useMemo(() => {
    const t = q.trim();
    if (!t) return list;
    const k = pinyinKey(t);
    const f = foldVi(t);
    return list.filter(
      (c) => c.char === t || c.pinyin.some((p) => pinyinKey(p) === k) || c.hanViet.some((h) => foldVi(h) === f),
    );
  }, [list, q]);

  const levels = [...new Set(filtered.map((c) => c.level))];

  return (
    <div className="space-y-5">
      <PageHeader
        icon="hanzi"
        title="Chữ Hán"
        description={`${list.length || "…"} chữ trong từ vựng HSK — xem thứ tự nét và tập viết`}
        actions={
          <Button variant="secondary" disabled={!list.length} onClick={() => navigate(`/hanzi/${encodeURIComponent(pick(list).char)}?mode=recall`)}>
            <Shuffle /> Viết ngẫu nhiên
          </Button>
        }
      />
      <Tabs value={tab} onValueChange={(v) => setParams(v === "chars" ? {} : { tab: v }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="chars">Chữ Hán</TabsTrigger>
          <TabsTrigger value="radicals">Bộ thủ</TabsTrigger>
        </TabsList>
        <TabsContent value="radicals" className="mt-5">
          <RadicalsTab />
        </TabsContent>
        <TabsContent value="chars" className="mt-5 space-y-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm chữ: 学, xue, học…"
              aria-label="Tìm chữ Hán"
              className="h-12 rounded-full pl-12 text-base"
            />
          </div>

          {loading ? (
            <Skeleton className="h-96 rounded-lg" />
          ) : (
            levels.map((lvl) => (
              <section key={lvl} className="space-y-3">
                <h2 className="flex items-center gap-2 font-black">
                  <PenLine className="size-4 text-primary" aria-hidden /> HSK {lvl}
                  <span className="text-sm font-bold text-muted-foreground">· {filtered.filter((c) => c.level === lvl).length} chữ</span>
                </h2>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                  {filtered
                    .filter((c) => c.level === lvl)
                    .map((c) => (
                      <Link
                        key={c.char}
                        to={`/hanzi/${encodeURIComponent(c.char)}`}
                        className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-border/70 bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span lang="zh-CN" className="hanzi text-3xl leading-none">
                          {c.char}
                        </span>
                        <span className={cn("mt-1 text-[11px] font-bold text-muted-foreground", !(showHanViet && c.hanViet[0]) && "font-pinyin")}>
                          {showHanViet && c.hanViet[0] ? c.hanViet[0] : c.pinyin[0]}
                        </span>
                      </Link>
                    ))}
                </div>
              </section>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
