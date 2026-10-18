import { ArrowRight, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Mascot } from "@/components/learning/Mascot";
import { QuestionView } from "@/components/learning/QuizQuestionView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { usePath } from "@/hooks/use-path";
import { useVocab } from "@/hooks/use-vocab";
import { buildPlacement, placementResult, type PlacementBlock } from "@/lib/placement";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";

export default function PlacementPage() {
  const { lessons } = usePath();
  const { words, loading } = useVocab();
  const setPlacement = useProgress((s) => s.setPlacement);
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<PlacementBlock[] | null>(null);
  const [b, setB] = useState(0);
  const [q, setQ] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correct, setCorrect] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const byId = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);
  const total = blocks?.reduce((n, x) => n + x.questions.length, 0) ?? 0;
  const answered = (blocks?.slice(0, b).reduce((n, x) => n + x.questions.length, 0) ?? 0) + q;

  const start = () => {
    if (!lessons) return;
    setBlocks(buildPlacement(lessons, byId));
    setB(0);
    setQ(0);
    setCorrect([]);
    setDone(false);
    setChosen(null);
  };

  const block = blocks?.[b];
  const cur = block?.questions[q];

  const choose = (key: string) => {
    if (!cur || chosen) return;
    setChosen(key);
    if (key === cur.answer) setCorrect((c) => Object.assign([...c], { [b]: (c[b] ?? 0) + 1 }));
  };

  const next = () => {
    if (!blocks || !block) return;
    setChosen(null);
    if (q + 1 < block.questions.length) return setQ(q + 1);
    // hết khối: dừng sớm nếu khối này chưa đạt
    const got = (correct[b] ?? 0) / block.questions.length;
    if (got < 0.8 || b + 1 >= blocks.length) return setDone(true);
    setB(b + 1);
    setQ(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!cur) return;
      if (!chosen && /^[1-4]$/.test(e.key)) choose(cur.options[Number(e.key) - 1]?.key);
      else if (chosen && e.key === "Enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!lessons || loading) return <Skeleton className="h-96 rounded-lg" />;

  if (done && blocks) {
    const last = placementResult(blocks, correct);
    const target = last ? lessons[lessons.findIndex((l) => l.id === last) + 1] : lessons[0];
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Mascot className="size-28 animate-wiggle" />
          <h1 className="text-2xl font-black">{last ? "Bạn đã có nền tảng rồi! 🎉" : "Bắt đầu từ đầu nhé!"}</h1>
          <p className="font-semibold text-muted-foreground">
            {last
              ? `Bạn nắm vững các bài tới ${blocks.find((x) => x.lastLessonId === last)?.label}. Nên bắt đầu từ: ${target?.title ?? "đã hết lộ trình"}.`
              : "Không sao cả — lộ trình từ bài 1 được thiết kế cho người mới hoàn toàn."}
          </p>
          <div className="w-full space-y-1.5 text-left">
            {blocks.map((x, i) => (
              <div key={x.lastLessonId} className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-2 text-sm font-bold">
                <span>{x.label}</span>
                <span className={cn((correct[i] ?? 0) / x.questions.length >= 0.8 ? "text-candy-mint-foreground" : "text-muted-foreground")}>
                  {i <= b ? `${correct[i] ?? 0}/${x.questions.length}` : "—"}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {last && (
              <Button
                size="lg"
                onClick={() => {
                  setPlacement(last);
                  toast.success("Đã mở khoá lộ trình theo kết quả của bạn");
                  navigate(target ? `/lesson/${target.id}` : "/path");
                }}
              >
                Mở khoá & học tiếp <ArrowRight />
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link to="/path">Về lộ trình</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (blocks && cur)
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-black text-muted-foreground">{block!.label}</p>
          <Progress value={(answered / total) * 100} className="h-3" aria-label="Tiến độ kiểm tra" />
        </div>
        <QuestionView key={`${b}-${q}`} q={cur} chosen={chosen} onChoose={choose} />
        {chosen && (
          <Button size="lg" className="w-full" onClick={next}>
            Tiếp <ArrowRight />
          </Button>
        )}
      </div>
    );

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeader icon="target" title="Kiểm tra xếp lớp" description="Đã biết chút tiếng Trung? Làm bài ngắn để nhảy tới đúng bài." />
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-candy-yellow text-candy-yellow-foreground">
              <Target className="size-7" aria-hidden />
            </span>
            <p className="font-semibold">
              Bài kiểm tra có tối đa {Math.ceil(lessons.filter((l) => l.level > 0).length / 10) * 5} câu, chia thành từng chặng theo lộ trình. Sai nhiều ở một chặng thì dừng —
              bạn sẽ bắt đầu từ chặng đó.
            </p>
          </div>
          <ul className="space-y-1 text-sm font-semibold text-muted-foreground">
            <li>• Mỗi chặng 5 câu, cần đúng 4 câu để qua.</li>
            <li>• Kết quả chỉ mở khoá bài, không xoá tiến độ hiện có.</li>
          </ul>
          <Button size="lg" className="w-full" onClick={start}>
            Bắt đầu kiểm tra
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
