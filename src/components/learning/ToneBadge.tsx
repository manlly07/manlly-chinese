import { type Tone, TONE_CLASS, TONE_NAMES } from "@/lib/pinyin";
import { cn } from "@/lib/utils";

const MARK: Record<Tone, string> = { 1: "ˉ", 2: "ˊ", 3: "ˇ", 4: "ˋ", 5: "·" };

export function ToneBadge({ tone, className }: { tone: Tone; className?: string }) {
  return (
    <span
      title={TONE_NAMES[tone]}
      className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", TONE_CLASS[tone], className)}
    >
      <span aria-hidden>{MARK[tone]}</span>
      {tone === 5 ? "nhẹ" : tone}
    </span>
  );
}
