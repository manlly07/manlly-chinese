import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { DialoguePlayer } from "@/components/learning/DialoguePlayer";
import { EmptyState } from "@/components/learning/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Dialogue, loadDialogues } from "@/lib/content";
import { Dictation } from "./components/Dictation";

export default function ListeningDetailPage() {
  const { id = "" } = useParams();
  const [items, setItems] = useState<Dialogue[] | null>(null);
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "listen";

  useEffect(() => {
    void loadDialogues().then(setItems);
  }, []);

  if (!items) return <Skeleton className="h-96 rounded-lg" />;
  const d = items.find((x) => x.id === id);
  if (!d) return <EmptyState title="Không tìm thấy hội thoại" mood="sleepy" action={<Button asChild><Link to="/listening">Về danh sách</Link></Button>} />;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/listening">
          <ArrowLeft /> Nghe & hội thoại
        </Link>
      </Button>
      <h1 className="text-2xl font-black md:text-3xl">{d.title}</h1>
      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="listen">Nghe hiểu</TabsTrigger>
          <TabsTrigger value="dictation">Chép chính tả</TabsTrigger>
        </TabsList>
        <TabsContent value="listen" className="mt-5 space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Mẹo: nghe cả bài khi đang ẩn chữ, đoán nghĩa, rồi bật Pinyin → Chữ Hán → Dịch để kiểm tra.</p>
          <Card>
            <CardContent className="p-4 md:p-6">
              <DialoguePlayer dialogue={d} listeningMode />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dictation" className="mt-5">
          <Dictation key={d.id} dialogue={d} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
