import { BrainCircuit, Map, Trophy } from "lucide-react";
import { type CuteName, CuteIcon } from "@/components/learning/CuteIcon";
import { Link } from "react-router-dom";
import { HanziText } from "@/components/learning/HanziText";
import { Mascot } from "@/components/learning/Mascot";
import { PinyinText } from "@/components/learning/PinyinText";
import { SpeakButton } from "@/components/learning/SpeakButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DailyQuests } from "@/components/learning/DailyQuests";
import { usePath } from "@/hooks/use-path";
import { dailyReviewId, weeklyTestId } from "@/lib/review-mix";
import { useProgress } from "@/store/progress";
import { useSettings } from "@/store/settings";
import { useDashboardStats } from "./use-dashboard-stats";

const CANDY = {
  pink: "bg-candy-pink text-candy-pink-foreground",
  yellow: "bg-candy-yellow text-candy-yellow-foreground",
  mint: "bg-candy-mint text-candy-mint-foreground",
  sky: "bg-candy-sky text-candy-sky-foreground",
  lilac: "bg-candy-lilac text-candy-lilac-foreground",
} as const;

function Stat({ icon, label, value, color }: { icon: CuteName; label: string; value: string | number; color: keyof typeof CANDY }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg p-3 sm:p-4", CANDY[color])}>
      <CuteIcon name={icon} className="size-11 sm:size-12" />
      <div className="min-w-0">
        <p className="text-2xl font-black leading-none">{value}</p>
        <p className="mt-1 text-xs font-bold opacity-90">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { streak, xpToday, due, learning, mature, levels } = useDashboardStats();
  const goal = useSettings((s) => s.dailyGoalXp);
  const showHanViet = useSettings((s) => s.showHanViet);
  const done = xpToday >= goal;
  const { next, nextCheckpoint, needsReview } = usePath();
  const tests = useProgress((s) => s.tests);
  const mistakes = useProgress((s) => Object.keys(s.mistakes).length);
  const learned = useProgress((s) => Object.keys(s.lessons).length > 0 || !!s.placement);
  const todo = [
    nextCheckpoint && { to: `/test/${nextCheckpoint.id}`, icon: "shield", text: `${nextCheckpoint.title} đã mở — làm để đi tiếp` },
    learned && !tests[dailyReviewId()] && { to: "/practice/daily", icon: "sparkle", text: "Ôn tổng hợp hôm nay (15 câu)" },
    learned && !tests[weeklyTestId()] && { to: "/test/weekly", icon: "clipboard", text: "Kiểm tra tổng hợp tuần này" },
    needsReview.length > 0 && { to: `/practice/lesson?id=${needsReview[0].id}`, icon: "bandage", text: `${needsReview.length} bài cần ôn lại` },
    mistakes > 0 && { to: "/practice/mistakes", icon: "bulb", text: `${mistakes} lỗi sai cần luyện lại` },
    next && !nextCheckpoint && { to: `/lesson/${next.id}`, icon: "rocket", text: `Học bài mới: ${next.title}` },
  ].filter((x): x is { to: string; icon: CuteName; text: string } => !!x);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-candy-pink via-candy-lilac to-candy-sky">
        <CardContent className="flex items-center gap-4 p-5 md:p-6">
          <Mascot className="size-24 shrink-0 animate-wiggle md:size-28" />
          <div className="min-w-0">
            <span className="relative mb-2 inline-block rounded-2xl rounded-bl-sm bg-card px-3 py-1 font-bold shadow-soft">
              <span className="hanzi">你好！</span> <span className="font-pinyin text-sm text-muted-foreground">Nǐ hǎo!</span>
            </span>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">Chào bạn!</h1>
            <p className="font-semibold text-foreground/75">Mỗi ngày một chút, rồi bạn sẽ thành thạo.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="flame" label="Ngày liên tiếp" value={streak} color="yellow" />
        <Stat icon="star" label={`XP hôm nay / ${goal}`} value={xpToday} color="pink" />
        <Stat icon="review" label="Thẻ đến hạn" value={due} color="sky" />
        <Stat icon="medal" label="Từ đã thuộc" value={mature} color="mint" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Mục tiêu hôm nay {done ? "🎉" : "🌱"}</CardTitle>
          <CardDescription className="font-semibold">
            {done ? "Tuyệt vời, bạn đã đạt mục tiêu!" : `Còn ${goal - xpToday} XP nữa là đạt mục tiêu.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Progress value={Math.min(100, (xpToday / goal) * 100)} aria-label="Tiến độ mục tiêu ngày" />
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to={next ? `/lesson/${next.id}` : "/path"}>
                <Map /> {next ? `Tiếp tục: ${next.title}` : "Lộ trình"}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/review">
                <BrainCircuit /> Ôn tập ({due})
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/quiz">
                <Trophy /> Luyện tập nhanh
              </Link>
            </Button>
          </div>
          {learning > 0 && <p className="text-sm font-semibold text-muted-foreground">Đang học {learning} từ.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {todo.length > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Việc cần làm hôm nay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todo.map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  className="flex items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3 font-bold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CuteIcon name={t.icon} className="size-9" />
                  <span className="flex-1">{t.text}</span>
                  <span aria-hidden>→</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-candy-mint text-candy-mint-foreground">
            <CardContent className="flex h-full items-center gap-3 p-5 font-black">🎉 Xong hết việc hôm nay! Học thêm bài mới nếu bạn muốn.</CardContent>
          </Card>
        )}
        <DailyQuests />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tiến độ theo cấp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {levels.map((l) => (
              <div key={l.level} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-black">HSK {l.level}</span>
                  <span className="font-bold text-muted-foreground">
                    {l.started}/{l.total} từ đã học · {l.mature} đã thuộc
                  </span>
                </div>
                <Progress value={(l.started / Math.max(1, l.total)) * 100} aria-label={`Tiến độ HSK ${l.level}`} />
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {[
            { to: "/vocab", icon: "vocab", label: "Từ vựng", cls: "bg-candy-pink text-candy-pink-foreground" },
            { to: "/hanzi", icon: "hanzi", label: "Tập viết chữ", cls: "bg-candy-lilac text-candy-lilac-foreground" },
            { to: "/pronunciation?tab=drill", icon: "note", label: "Luyện thanh", cls: "bg-candy-sky text-candy-sky-foreground" },
            { to: "/stats", icon: "stats", label: "Thống kê", cls: "bg-candy-mint text-candy-mint-foreground" },
          ].map(({ to, icon, label, cls }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "group flex flex-col justify-between gap-4 rounded-lg p-4 font-black shadow-soft transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                cls,
              )}
            >
              <CuteIcon name={icon as CuteName} className="size-12 transition-transform group-hover:-rotate-6 group-hover:scale-110" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Câu đầu tiên</CardTitle>
          <CardDescription className="font-semibold">Bấm loa để nghe. Màu sắc cho biết thanh điệu của từng âm tiết.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-candy-yellow text-candy-yellow-foreground">
            <HanziText variant="list">你好</HanziText>
          </span>
          <div className="min-w-0 flex-1">
            <PinyinText pinyin="nǐ hǎo" className="text-lg font-bold" />
            <p className="text-sm font-semibold">
              xin chào{showHanViet && <span className="text-muted-foreground"> · Hán Việt: nễ hảo</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              Đọc thực tế: <PinyinText pinyin="nǐ hǎo" sandhi /> (3 + 3 → 2 + 3)
            </p>
          </div>
          <SpeakButton text="你好" variant="secondary" />
        </CardContent>
      </Card>
    </div>
  );
}
