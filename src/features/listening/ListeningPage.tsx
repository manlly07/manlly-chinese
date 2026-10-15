import { Headphones, MessagesSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Dialogue, type Lesson, loadDialogues, loadLessons } from "@/lib/content";

export default function ListeningPage() {
  const [items, setItems] = useState<Dialogue[] | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [level, setLevel] = useState("1");

  useEffect(() => {
    void loadDialogues().then(setItems);
    void loadLessons().then(setLessons);
  }, []);
  const lessonOf = useMemo(() => new Map(lessons.filter((l) => l.dialogue).map((l) => [l.dialogue!, l])), [lessons]);

  return (
    <div className="space-y-5">
      <PageHeader icon="listening" title="Nghe & hội thoại" description="Nghe trước, đoán nghĩa, rồi mới xem chữ — và luyện chép chính tả" />
      <Tabs value={level} onValueChange={setLevel}>
        <TabsList>
          <TabsTrigger value="1">HSK 1</TabsTrigger>
          <TabsTrigger value="2">HSK 2</TabsTrigger>
        </TabsList>
      </Tabs>
      {!items ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items
            .filter((d) => String(d.level) === level)
            .map((d, i) => (
              <Link
                key={d.id}
                to={`/listening/${d.id}`}
                className="group flex min-w-0 items-center gap-3 rounded-lg border border-border/70 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${i % 2 ? "bg-candy-sky text-candy-sky-foreground" : "bg-candy-pink text-candy-pink-foreground"}`}>
                  {i % 2 ? <Headphones className="size-6" aria-hidden /> : <MessagesSquare className="size-6" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-black">{d.title}</span>
                  <span lang="zh-CN" className="hanzi block truncate text-sm text-muted-foreground">
                    {d.lines[0]?.zh}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {d.lines.length} câu{lessonOf.get(d.id) && ` · Bài ${lessonOf.get(d.id)!.id.slice(-2)}`}
                  </span>
                </span>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
