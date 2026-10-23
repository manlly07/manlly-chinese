import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PinyinText } from "@/components/learning/PinyinText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Lesson, Word } from "@/lib/content";
import { searchWords } from "@/lib/search";
import { fromWord, parseCustom, type SheetWord } from "@/lib/worksheet";

interface Props {
  vocab: Word[];
  lessons: Lesson[];
  onAdd: (words: SheetWord[], title?: string) => void;
}

const selectClass =
  "h-11 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Ba cách chọn từ: cả bài học · tìm từ (Hán / pinyin / nghĩa) · tự gõ chữ Hán. */
export function WordPicker({ vocab, lessons, onAdd }: Props) {
  const byId = useMemo(() => new Map(vocab.map((w) => [w.id, w])), [vocab]);
  const hskLessons = lessons.filter((l) => l.words.length);
  const [lessonId, setLessonId] = useState(hskLessons[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState("");
  const results = useMemo(() => (q.trim() ? searchWords(vocab, q).slice(0, 8) : []), [vocab, q]);

  const addLesson = () => {
    const l = hskLessons.find((x) => x.id === lessonId);
    if (!l) return;
    onAdd(
      l.words.map((id) => byId.get(id)).filter((w): w is Word => !!w).map(fromWord),
      `HSK ${l.level} · Bài ${l.id.slice(-2)} · ${l.title}`,
    );
  };

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <p className="text-sm font-black">Lấy cả bài học</p>
        <div className="flex gap-2">
          <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className={selectClass} aria-label="Chọn bài học">
            {hskLessons.map((l) => (
              <option key={l.id} value={l.id}>
                HSK {l.level} · Bài {l.id.slice(-2)} · {l.title}
              </option>
            ))}
          </select>
          <Button onClick={addLesson}>
            <Plus /> Thêm
          </Button>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-sm font-black">Tìm từ</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="你好, ni hao, xin chào…" className="h-11 rounded-full pl-10" aria-label="Tìm từ để thêm" />
        </div>
        {results.length > 0 && (
          <ul className="divide-y rounded-2xl border border-border/70">
            {results.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => onAdd([fromWord(w)])}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none"
                >
                  <span className="hanzi text-xl">{w.hanzi}</span>
                  <PinyinText pinyin={w.pinyin} className="text-sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-muted-foreground">{w.meaning[0]}</span>
                  <Plus className="size-4 text-primary" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <p className="text-sm font-black">Tự gõ chữ Hán</p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const ws = parseCustom(custom, vocab);
            if (ws.length) onAdd(ws);
            setCustom("");
          }}
        >
          <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="上 土 万 (cách nhau dấu cách)" className="hanzi h-11 rounded-full" aria-label="Gõ chữ Hán" />
          <Button type="submit" variant="secondary">
            <Plus /> Thêm
          </Button>
        </form>
        <p className="text-xs font-semibold text-muted-foreground">Chữ ngoài từ vựng của app vẫn in được — bạn tự điền pinyin và nghĩa ở danh sách bên dưới.</p>
      </section>
    </div>
  );
}
