import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { SyllableBlender } from "@/components/learning/SyllableBlender";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PinyinData, PinyinSpec, Syllable } from "@/lib/content";
import { type PinyinScope, tonesOf } from "@/lib/syllables";

interface Props {
  spec: PinyinSpec;
  scope: PinyinScope;
  data: PinyinData;
  syllables: Syllable[];
  onDone: () => void;
}

/**
 * Bước "Ghép vần": vài âm tiết mẫu (ch + a → cha) rồi bảng tự ghép với MỌI mảnh đã học —
 * người học tự khám phá âm tiết mới (chi, chu, chai…) thay vì học thuộc từng âm.
 */
export function BlendStep({ spec, scope, data, syllables, onDone }: Props) {
  // thứ tự hiển thị theo bảng pinyin chuẩn
  const initials = data.initials.map((x) => x.py).filter((p) => scope.initials.has(p));
  const finals = data.finals.map((x) => x.py).filter((p) => scope.finals.has(p));
  const demo = useMemo(
    () => spec.demo.map((s) => syllables.find((x) => x.s === s)).filter((x): x is Syllable => !!x && tonesOf(x).length > 0),
    [spec.demo, syllables],
  );
  const [pick, setPick] = useState<Syllable | undefined>(demo[0]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {demo.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Ghép thử</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold text-muted-foreground">Bấm một âm tiết để xem nó được ghép từ những mảnh nào.</p>
            <div className="flex flex-wrap gap-2">
              {demo.map((s) => (
                <button
                  key={s.s}
                  type="button"
                  onClick={() => setPick(s)}
                  aria-pressed={pick?.s === s.s}
                  className="rounded-xl border-2 border-border/70 bg-card px-2.5 py-1.5 font-pinyin text-sm font-black transition-all hover:border-primary/50 aria-pressed:border-primary aria-pressed:bg-candy-yellow aria-pressed:text-candy-yellow-foreground"
                >
                  {s.i || "∅"} + {s.f} → {s.s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Bảng ghép vần</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 font-semibold text-muted-foreground">
            Bạn đã có {scope.initials.size} phụ âm đầu và {scope.finals.size} vần — tự ghép thử những âm tiết chưa có trong ví dụ!
          </p>
          <SyllableBlender
            key={pick?.s}
            syllables={syllables}
            initials={initials}
            finals={finals}
            zero={scope.zero}
            initial={pick ? [pick.i, pick.f] : undefined}
          />
        </CardContent>
      </Card>

      {spec.rules.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Ghi nhớ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spec.rules.map((r) => (
              <div key={r.title} className="space-y-1.5">
                <p className="font-black">📌 {r.title}</p>
                <p className="text-sm font-semibold text-muted-foreground">{r.explain}</p>
                {r.examples.length > 0 && (
                  <p className="flex flex-wrap gap-2">
                    {r.examples.map((e) => (
                      <span key={e.answer} className="rounded-xl bg-muted px-2.5 py-1 font-pinyin text-sm font-black">
                        {e.parts[0] || "∅"} + {e.parts[1]} → <span className="text-primary">{e.answer}</span>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button size="lg" className="w-full" onClick={onDone}>
        Làm bài tập <ChevronRight />
      </Button>
    </div>
  );
}
