import { NotebookPen, Play, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { ExerciseRunner, type RunnerResult } from "@/components/learning/exercises/ExerciseRunner";
import { SessionResult } from "@/components/learning/SessionResult";
import { Button } from "@/components/ui/button";
import type { Word } from "@/lib/content";
import type { Exercise } from "@/lib/exercises";
import type { HanziParts } from "@/lib/hanzi-parts";
import { cn } from "@/lib/utils";
import { buildWordPractice, PRACTICE_SKILLS, type PracticeSkill } from "@/lib/word-practice";
import { useProgress } from "@/store/progress";

interface CardProps {
  words: Word[];
  /** chữ Hán tự thêm chưa có pinyin/nghĩa → không ra đề được */
  skipped: string[];
  skills: PracticeSkill[];
  onSkills: (s: PracticeSkill[]) => void;
  vocab: Word[];
  hp: HanziParts | null;
  onStart: () => void;
}

/** Chọn kỹ năng muốn luyện cho các từ trong vở. */
export function PracticeSetup({ words, skipped, skills, onSkills, vocab, hp, onStart }: CardProps) {
  // chỉ để đếm số câu — đề thật sinh lại khi bấm bắt đầu
  const count = useMemo(() => buildWordPractice(words, vocab, hp, skills).length, [words, vocab, hp, skills]);
  const toggle = (id: PracticeSkill) => onSkills(skills.includes(id) ? skills.filter((s) => s !== id) : [...skills, id]);

  return (
    <div className="space-y-3">
      <p className="text-sm font-black">Kỹ năng</p>
      <div className="grid grid-cols-2 gap-1.5">
        {PRACTICE_SKILLS.map((s) => {
          const on = skills.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(s.id)}
              className={cn(
                "rounded-2xl px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              <span className="block text-sm font-black">{s.label}</span>
              <span className={cn("block text-xs font-semibold", on ? "opacity-90" : "")}>{s.hint}</span>
            </button>
          );
        })}
      </div>
      {skipped.length > 0 && (
        <p className="rounded-2xl bg-candy-yellow p-3 text-xs font-bold text-candy-yellow-foreground">
          Chưa ra đề được cho <span className="hanzi">{skipped.join(" ")}</span> — điền pinyin và nghĩa ở mục 2 để luyện cả các chữ này.
        </p>
      )}
      <Button size="lg" className="w-full" disabled={!count} onClick={onStart}>
        <Play /> {count ? `Bắt đầu luyện · ${count} câu` : words.length ? "Chọn ít nhất một kỹ năng" : "Thêm từ để luyện"}
      </Button>
    </div>
  );
}

/** Phiên luyện ngay trong trang vở: làm bài → kết quả → luyện lại / về vở (danh sách từ giữ nguyên). */
export function PracticeSession({ build, onExit }: { build: () => Exercise[]; onExit: () => void }) {
  const review = useProgress((s) => s.review);
  const [exercises, setExercises] = useState(build);
  const [result, setResult] = useState<{ r: RunnerResult; xp: number } | null>(null);

  if (result)
    return (
      <SessionResult
        result={result.r}
        xp={result.xp}
        title="Luyện xong rồi! 🎉"
        subtitle={result.r.correct === result.r.total ? "Không sai câu nào — xuất sắc!" : undefined}
        actions={
          <>
            <Button
              size="lg"
              onClick={() => {
                setExercises(build());
                setResult(null);
              }}
            >
              <RotateCcw /> Luyện lại
            </Button>
            <Button size="lg" variant="outline" onClick={onExit}>
              <NotebookPen /> Về vở tập viết
            </Button>
          </>
        }
      />
    );

  return (
    <ExerciseRunner
      key={exercises.map((e) => e.ref).join()}
      label="Luyện từ trong vở"
      exercises={exercises}
      onExit={onExit}
      onFinish={(r) => {
        // trả lời trúng từ đang đến hạn = một lượt ôn SRS (như phiên ôn tự do)
        const { cards } = useProgress.getState();
        const now = Date.now();
        let xp = 0;
        for (const id of r.rightWords) if (cards[id] && cards[id].due <= now) xp += review(id, 2, { seconds: 6 });
        for (const id of r.wrongWords) if (cards[id] && cards[id].due <= now) xp += review(id, 0, { seconds: 6 });
        setResult({ r, xp });
      }}
    />
  );
}
