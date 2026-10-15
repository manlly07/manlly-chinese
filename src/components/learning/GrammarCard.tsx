import { AlertTriangle } from "lucide-react";
import type { GrammarPoint } from "@/lib/content";
import { HanziText } from "./HanziText";
import { SpeakButton } from "./SpeakButton";

/** Trình bày một điểm ngữ pháp: cấu trúc, giải thích, ví dụ, lỗi người Việt hay mắc. */
export function GrammarCard({ g }: { g: GrammarPoint }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-candy-lilac to-candy-sky p-4 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-foreground/60">Cấu trúc</p>
        <p lang="zh-CN" className="hanzi mt-1 text-2xl font-bold md:text-3xl">
          {g.pattern}
        </p>
      </div>
      <p className="font-semibold leading-relaxed">{g.explain}</p>
      <div className="space-y-2">
        {g.examples.map((ex, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl bg-muted/60 p-3">
            <div className="min-w-0 flex-1">
              <HanziText className="font-bold">{ex.zh}</HanziText>
              <p className="font-pinyin text-sm font-semibold text-muted-foreground">{ex.py}</p>
              <p className="text-sm font-semibold">{ex.vi}</p>
            </div>
            <SpeakButton text={ex.zh} label="Nghe câu ví dụ" />
          </div>
        ))}
      </div>
      {g.vnPitfalls.length > 0 && (
        <div className="rounded-2xl border-2 border-candy-yellow-foreground/30 bg-candy-yellow p-4 text-candy-yellow-foreground">
          <p className="flex items-center gap-2 font-black">
            <AlertTriangle className="size-4" aria-hidden /> Người Việt hay nhầm
          </p>
          <ul className="mt-2 space-y-1">
            {g.vnPitfalls.map((p) => (
              <li key={p} className="font-semibold">
                • <span lang="zh-CN">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
