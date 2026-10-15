import { ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type GrammarPoint, type Lesson, loadGrammar, loadLessons } from "@/lib/content";
import { foldVi } from "@/lib/search";

export default function GrammarPage() {
  const [items, setItems] = useState<GrammarPoint[] | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [level, setLevel] = useState("1");
  const [q, setQ] = useState("");

  useEffect(() => {
    void loadGrammar().then(setItems);
    void loadLessons().then(setLessons);
  }, []);

  const lessonOf = useMemo(() => {
    const m = new Map<string, Lesson>();
    for (const l of lessons) for (const g of l.grammar) if (!m.has(g)) m.set(g, l);
    return m;
  }, [lessons]);

  const list = (items ?? []).filter(
    (g) => String(g.level) === level && (!q.trim() || foldVi(`${g.title} ${g.pattern} ${g.explain}`).includes(foldVi(q)) || g.pattern.includes(q.trim())),
  );

  return (
    <div className="space-y-5">
      <PageHeader icon="grammar" title="Ngữ pháp" description="Cấu trúc câu giải thích bằng tiếng Việt, kèm lỗi người Việt hay mắc" />
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={level} onValueChange={setLevel}>
          <TabsList>
            <TabsTrigger value="1">HSK 1</TabsTrigger>
            <TabsTrigger value="2">HSK 2</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm: 是, so sánh, đã từng…" aria-label="Tìm ngữ pháp" className="rounded-full pl-10" />
        </div>
      </div>
      {!items ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {list.map((g, i) => {
            const l = lessonOf.get(g.id);
            return (
              <Link
                key={g.id}
                to={`/grammar/${g.id}`}
                className="group flex min-w-0 items-center gap-3 rounded-lg border border-border/70 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-candy-lilac font-black text-candy-lilac-foreground">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-black">{g.title}</span>
                  <span lang="zh-CN" className="hanzi block truncate text-muted-foreground">
                    {g.pattern}
                  </span>
                  {l && <span className="text-xs font-bold text-muted-foreground">Bài {l.id.slice(-2)} · {l.title}</span>}
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
