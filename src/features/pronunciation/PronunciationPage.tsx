import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadPinyin, type PinyinData } from "@/lib/content";
import { ChartTab } from "./components/ChartTab";
import { SandhiTab } from "./components/SandhiTab";
import { SpeakTab } from "./components/SpeakTab";
import { ToneDrill } from "./components/ToneDrill";
import { TonesTab } from "./components/TonesTab";

export default function PronunciationPage() {
  const [data, setData] = useState<PinyinData | null>(null);
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "tones";

  useEffect(() => {
    void loadPinyin().then(setData);
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader icon="pronunciation" title="Phát âm" description="Nắm vững pinyin và 4 thanh điệu, rồi luyện nói và so cao độ giọng mình với thanh chuẩn" />
      {!data ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : (
        <Tabs value={tab} onValueChange={(v) => setParams({ tab: v }, { replace: true })}>
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
            <TabsList>
              <TabsTrigger value="tones">Thanh điệu</TabsTrigger>
              <TabsTrigger value="chart">Bảng pinyin</TabsTrigger>
              <TabsTrigger value="drill">Luyện nghe</TabsTrigger>
              <TabsTrigger value="speak">Luyện nói</TabsTrigger>
              <TabsTrigger value="sandhi">Biến điệu</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="tones" className="mt-5">
            <TonesTab data={data} />
          </TabsContent>
          <TabsContent value="chart" className="mt-5">
            <ChartTab data={data} />
          </TabsContent>
          <TabsContent value="drill" className="mt-5">
            <ToneDrill data={data} />
          </TabsContent>
          <TabsContent value="speak" className="mt-5">
            <SpeakTab data={data} />
          </TabsContent>
          <TabsContent value="sandhi" className="mt-5">
            <SandhiTab data={data} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
