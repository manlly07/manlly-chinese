import { RotateCcw, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Mascot } from "@/components/learning/Mascot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Lesson } from "@/lib/content";
import { PASS_SCORE, stars } from "@/lib/path";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  xp: number;
  next?: Lesson;
  newWords: number;
  onRetry: () => void;
}

export function LessonSummary({ score, xp, next, newWords, onRetry }: Props) {
  const pass = score >= PASS_SCORE;
  const s = stars(score);
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <Mascot mood={pass ? "happy" : "sleepy"} className="size-28 animate-wiggle" />
        <div className="flex gap-1" aria-label={`${s} sao`}>
          {[1, 2, 3].map((n) => (
            <Star key={n} className={cn("size-10", n <= s ? "fill-chart-new text-chart-new" : "text-muted-foreground/30")} aria-hidden />
          ))}
        </div>
        <p className="text-5xl font-black text-primary">{Math.round(score * 100)}%</p>
        <p className="text-lg font-black">{pass ? "Hoàn thành bài học! 🎉" : "Gần được rồi! Cần 80% để mở bài tiếp."}</p>
        <p className="font-semibold text-muted-foreground">
          +{xp} XP{newWords > 0 && ` · ${newWords} từ mới đã vào Ôn tập`}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {pass && next ? (
            <Button size="lg" asChild>
              <Link to={`/lesson/${next.id}`}>Bài tiếp: {next.title}</Link>
            </Button>
          ) : (
            <Button size="lg" onClick={onRetry}>
              <RotateCcw /> Làm lại bài tập
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
