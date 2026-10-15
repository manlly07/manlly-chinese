import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "@/components/layout/nav";
import { Mascot } from "@/components/learning/Mascot";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Trang tạm cho các module chưa làm (theo docs/ROADMAP.md). */
export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const item = NAV_ITEMS.find((i) => i.path !== "/" && pathname.startsWith(i.path));
  return (
    <div className="space-y-6">
      <PageHeader icon={item?.icon} title={item?.label ?? "Không tìm thấy trang"} />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <Mascot mood="sleepy" className="size-28" />
          <p className="max-w-sm font-semibold text-muted-foreground">
            {item ? "Gấu trúc đang chuẩn bị phần này. Bạn quay lại sau nhé!" : "Trang bạn tìm không tồn tại."}
          </p>
          <Button asChild variant="outline">
            <Link to="/">Về trang tổng quan</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
