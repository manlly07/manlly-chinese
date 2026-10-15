import { type CuteName, CuteIcon } from "@/components/learning/CuteIcon";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { usePath } from "@/hooks/use-path";
import { cn } from "@/lib/utils";
import { dailyReviewId, weeklyTestId } from "@/lib/review-mix";
import { useProgress } from "@/store/progress";
import { DailyQuests } from "@/components/learning/DailyQuests";

function HubCard({ to, icon, title, desc, badge, cls, big = false }: { to: string; icon: CuteName; title: string; desc: string; badge?: string; cls: string; big?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative flex gap-4 rounded-lg p-5 shadow-soft transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        big ? "flex-col sm:flex-row sm:items-center" : "flex-col items-start gap-3 p-4",
        cls,
      )}
    >
      <span className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-card/70", big ? "size-20" : "size-14")}>
        <CuteIcon name={icon} className={cn("transition-transform group-hover:-rotate-6 group-hover:scale-110", big ? "size-12" : "size-10")} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block font-black", big ? "text-xl" : "text-base")}>{title}</span>
        <span className="block text-sm font-semibold opacity-90">{desc}</span>
      </span>
      {badge && <span className="absolute right-3 top-3 rounded-full bg-card px-2.5 py-0.5 text-xs font-black text-foreground">{badge}</span>}
    </Link>
  );
}

export default function PracticePage() {
  const mistakes = useProgress((s) => Object.keys(s.mistakes).length);
  const tests = useProgress((s) => s.tests);
  const learned = useProgress((s) => Object.keys(s.lessons).length + (s.placement ? 1 : 0));
  const { needsReview } = usePath();
  const dailyDone = !!tests[dailyReviewId()];
  const weekly = tests[weeklyTestId()];

  return (
    <div className="space-y-6">
      <PageHeader icon="practice" title="Luyện tập" description="Ôn thường xuyên mọi thứ đã học — nhớ lâu, không quên" />
      {learned === 0 && (
        <Card className="bg-candy-yellow text-candy-yellow-foreground">
          <CardContent className="p-5 font-bold">Học ít nhất một bài trong Lộ trình để mở Ôn tổng hợp và Kiểm tra tuần nhé!</CardContent>
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <HubCard
            big
            to="/practice/daily"
            icon="sparkle"
            title="Ôn tổng hợp hôm nay"
            desc="15 câu từ mọi bài đã học: từ sắp quên, ngữ pháp, nghe — ưu tiên phần bạn hay sai."
            badge={dailyDone ? "Đã ôn ✓" : "+30 XP"}
            cls="bg-gradient-to-br from-candy-pink to-candy-lilac text-foreground"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <HubCard
              to="/test/weekly"
              icon="clipboard"
              title="Kiểm tra tuần"
              desc="20 câu tính điểm, phủ toàn bộ kiến thức."
              badge={weekly ? `${Math.round(weekly.best * 100)}%` : "Tuần này"}
              cls="bg-candy-sky text-candy-sky-foreground"
            />
            <HubCard
              to="/practice/mistakes"
              icon="bandage"
              title="Sửa lỗi sai"
              desc={mistakes ? "Luyện lại các câu từng trả lời sai." : "Chưa có lỗi nào — tuyệt!"}
              badge={mistakes ? `${mistakes}` : undefined}
              cls="bg-candy-yellow text-candy-yellow-foreground"
            />
          </div>
          {needsReview.length > 0 && (
            <Card>
              <CardContent className="space-y-3 p-5">
                <p className="flex items-center gap-2 font-black">
                  <CuteIcon name="review" className="size-8" /> Bài cần ôn lại ({needsReview.length})
                </p>
                <p className="text-sm font-semibold text-muted-foreground">Nhiều từ trong các bài này đã đến hạn ôn.</p>
                <div className="flex flex-wrap gap-2">
                  {needsReview.slice(0, 8).map((l) => (
                    <Link key={l.id} to={`/practice/lesson?id=${l.id}`} className="rounded-full bg-candy-pink px-3 py-1.5 text-sm font-black text-candy-pink-foreground hover:opacity-90">
                      {l.title}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <HubCard to="/quiz" icon="star" title="Quiz nhanh" desc="5 dạng câu hỏi" cls="bg-card" />
            <HubCard to="/pronunciation?tab=speak" icon="pronunciation" title="Luyện nói" desc="Ghi âm & so thanh" cls="bg-card" />
            <HubCard to="/pronunciation?tab=drill" icon="note" title="Thanh điệu" desc="Nghe & chọn thanh" cls="bg-card" />
            <HubCard to="/listening" icon="listening" title="Chính tả" desc="Nghe & gõ lại" cls="bg-card" />
            <HubCard to="/grammar" icon="grammar" title="Ngữ pháp" desc="Luyện theo điểm" cls="bg-card" />
            <HubCard to="/hanzi" icon="hanzi" title="Tập viết" desc="Viết chữ Hán" cls="bg-card" />
          </div>
        </div>
        <div className="space-y-4">
          <DailyQuests />
        </div>
      </div>
    </div>
  );
}
