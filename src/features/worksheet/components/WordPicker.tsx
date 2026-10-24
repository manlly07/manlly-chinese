import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Lesson, Word } from "@/lib/content";
import { fromWord, type SheetWord } from "@/lib/worksheet";
import { WordSearch } from "./WordSearch";

interface Props {
  vocab: Word[];
  lessons: Lesson[];
  /** chữ Hán đã có trong vở */
  added: Set<string>;
  onAdd: (words: SheetWord[], title?: string) => void;
}

const selectClass =
  "h-11 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Chọn từ: lấy cả bài học, hoặc một ô tìm có gợi ý (tiếng Việt / chữ Hán / pinyin, kể cả chữ ngoài từ vựng). */
export function WordPicker({ vocab, lessons, added, onAdd }: Props) {
  const byId = useMemo(() => new Map(vocab.map((w) => [w.id, w])), [vocab]);
  const hskLessons = lessons.filter((l) => l.words.length);
  // danh sách bài tải sau lần render đầu → chưa chọn gì thì lấy bài đầu tiên
  const [picked, setLessonId] = useState("");
  const lessonId = picked || hskLessons[0]?.id || "";

  const addLesson = () => {
    const l = hskLessons.find((x) => x.id === lessonId);
    if (!l) return;
    onAdd(
      l.words.map((id) => byId.get(id)).filter((w): w is Word => !!w).map(fromWord),
      l.title,
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
        <p className="text-sm font-black">Thêm từ</p>
        <WordSearch vocab={vocab} added={added} onAdd={(ws) => onAdd(ws)} />
        <p className="text-xs font-semibold text-muted-foreground">Chữ ngoài từ vựng của app vẫn in được — bạn tự điền pinyin và nghĩa ở danh sách bên dưới.</p>
      </section>
    </div>
  );
}
