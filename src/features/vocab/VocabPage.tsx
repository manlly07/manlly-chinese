import { Heart, Search, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/learning/EmptyState";
import { WordCard } from "@/components/learning/WordCard";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVocab } from "@/hooks/use-vocab";
import { availableVocabLevels } from "@/lib/content";
import { TOPIC_LABELS } from "@/lib/labels";
import { useVocabFilters } from "./use-vocab-filters";

export default function VocabPage() {
  const { words, loading } = useVocab();
  const { q, level, topic, topics, results, set } = useVocabFilters(words);

  return (
    <div className="space-y-5">
      <PageHeader icon="vocab" title="Từ vựng" description={`${words.length || "…"} từ HSK — chạm vào từ để xem chi tiết`} />

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Tìm: 学习, xuexi, xué xí, học…"
          aria-label="Tìm từ vựng"
          className="h-12 rounded-full pl-12 pr-12 text-base"
        />
        {q && (
          <button
            type="button"
            onClick={() => set({ q: "" })}
            aria-label="Xoá tìm kiếm"
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <Tabs value={level} onValueChange={(v) => set({ level: v === "all" ? "" : v, topic: "" })}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          {availableVocabLevels().map((l) => (
            <TabsTrigger key={l} value={String(l)}>
              HSK {l}
            </TabsTrigger>
          ))}
          <TabsTrigger value="fav" aria-label="Yêu thích">
            <Heart className="size-4" />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {topics.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          <Chip active={!topic} onClick={() => set({ topic: "" })}>
            Mọi chủ đề
          </Chip>
          {topics.map(([t, n]) => (
            <Chip key={t} active={topic === t} onClick={() => set({ topic: topic === t ? "" : t })}>
              <span aria-hidden>{TOPIC_LABELS[t]?.emoji}</span>
              {TOPIC_LABELS[t]?.label ?? t}
              <span className="opacity-60">{n}</span>
            </Chip>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : results.length === 0 ? (
        level === "fav" && !q ? (
          <EmptyState title="Chưa có từ yêu thích">Bấm biểu tượng trái tim ở một từ để lưu vào đây.</EmptyState>
        ) : (
          <EmptyState title="Không tìm thấy từ nào" mood="sleepy" action={<Button variant="outline" onClick={() => set({ q: "", topic: "" })}>Xoá bộ lọc</Button>}>
            Thử gõ pinyin không dấu (vd. “pengyou”) hoặc nghĩa tiếng Việt.
          </EmptyState>
        )
      ) : (
        <>
          <p className="text-sm font-bold text-muted-foreground">{results.length} từ</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {results.map((w) => (
              <WordCard key={w.id} word={w} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
