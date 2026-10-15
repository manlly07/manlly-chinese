import { ArrowRight } from "lucide-react";
import { HanziText } from "@/components/learning/HanziText";
import { PinyinText } from "@/components/learning/PinyinText";
import { SpeakButton } from "@/components/learning/SpeakButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PinyinData } from "@/lib/content";

export function SandhiTab({ data }: { data: PinyinData }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.sandhi.map((r) => (
        <Card key={r.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{r.title}</CardTitle>
            <p className="text-sm font-semibold text-muted-foreground">{r.explain}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {r.examples.map((ex) => (
              <div key={ex.hanzi} className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2">
                <HanziText variant="inline" className="w-14 font-bold">
                  {ex.hanzi}
                </HanziText>
                <span className="flex flex-1 flex-wrap items-center gap-2 text-sm">
                  <PinyinText pinyin={ex.pinyin} />
                  {ex.actual !== ex.pinyin && (
                    <>
                      <ArrowRight className="size-4 text-muted-foreground" aria-label="đọc thành" />
                      <PinyinText pinyin={ex.actual} className="font-black" />
                    </>
                  )}
                </span>
                <SpeakButton text={ex.hanzi} />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <Card className="bg-candy-lilac text-candy-lilac-foreground md:col-span-2">
        <CardContent className="p-5 font-semibold">
          💡 Dữ liệu trong ứng dụng luôn ghi <b>thanh gốc</b> (vd. 你好 nǐ hǎo). Ở trang chi tiết từ, bấm “Xem cách đọc thực tế” để thấy thanh sau biến điệu.
        </CardContent>
      </Card>
    </div>
  );
}
