import { useEffect, useState } from "react";
import { SyllableBlender } from "@/components/learning/SyllableBlender";
import { VoiceWarning } from "@/components/learning/VoiceWarning";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { loadSyllables, type PinyinData, type Syllable } from "@/lib/content";

/** Bảng ghép vần đầy đủ: mọi phụ âm đầu × mọi vần. y/w được thay bằng ô "không phụ âm đầu" (∅). */
export function BlendTab({ data }: { data: PinyinData }) {
  const [syllables, setSyllables] = useState<Syllable[] | null>(null);
  useEffect(() => {
    void loadSyllables().then(setSyllables);
  }, []);
  if (!syllables) return <Skeleton className="h-96 rounded-lg" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <VoiceWarning className="lg:col-span-2" />
      <SyllableBlender
        syllables={syllables}
        initials={data.initials.map((x) => x.py).filter((p) => p !== "y" && p !== "w")}
        finals={data.finals.map((x) => x.py)}
        zero
        initial={["ch", "a"]}
      />
      <Card className="h-fit lg:sticky lg:top-20">
        <CardContent className="space-y-3 p-5 text-sm font-semibold">
          <p className="text-base font-black">Cách dùng</p>
          <p>Chọn một phụ âm đầu và một vần để xem chúng ghép thành âm tiết nào, rồi bấm từng thanh để nghe.</p>
          <p>Ô mờ là mảnh không ghép được với lựa chọn hiện tại — ví dụ j q x chỉ đi với vần bắt đầu bằng i hoặc ü.</p>
          <p>
            Ô <span className="font-pinyin font-black">∅</span> là âm tiết không có phụ âm đầu: i → yi, u → wu, ü → yu…
          </p>
          <p className="text-muted-foreground">Mẹo: học ch + a = cha rồi, thử đổi vần để tự đọc chi, chu, chai, chao…</p>
        </CardContent>
      </Card>
    </div>
  );
}
