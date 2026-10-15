import { Link } from "react-router-dom";
import { Mascot } from "@/components/learning/Mascot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SessionStats } from "../use-review-session";

export function SessionSummary({ stats, onAgain }: { stats: SessionStats; onAgain: () => void }) {
  const acc = stats.done ? Math.round((stats.correct / stats.done) * 100) : 0;
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <Mascot className="size-28 animate-wiggle" />
        <h2 className="text-2xl font-black">Hoàn thành phiên ôn! 🎉</h2>
        <div className="grid w-full max-w-sm grid-cols-3 gap-2">
          {[
            ["Lượt", stats.done, "bg-candy-sky text-candy-sky-foreground"],
            ["Nhớ", `${acc}%`, "bg-candy-mint text-candy-mint-foreground"],
            ["XP", `+${stats.xp}`, "bg-candy-yellow text-candy-yellow-foreground"],
          ].map(([l, v, c]) => (
            <div key={l as string} className={`rounded-2xl p-3 ${c}`}>
              <p className="text-2xl font-black">{v}</p>
              <p className="text-xs font-bold">{l}</p>
            </div>
          ))}
        </div>
        {stats.newWords > 0 && <p className="font-semibold text-muted-foreground">Bạn vừa học {stats.newWords} từ mới.</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={onAgain}>Ôn tiếp</Button>
          <Button asChild variant="outline">
            <Link to="/">Về tổng quan</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
