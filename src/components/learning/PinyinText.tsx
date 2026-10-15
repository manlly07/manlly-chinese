import { sandhiSyllables, splitSyllables, TONE_CLASS, toneOf } from "@/lib/pinyin";
import { cn } from "@/lib/utils";

interface PinyinTextProps {
  /** pinyin có dấu, âm tiết cách nhau dấu cách ("xué xí") hoặc viết liền ("xuéxí") */
  pinyin: string;
  /** tô màu theo thanh (mặc định bật) */
  colored?: boolean;
  /** hiển thị thanh đọc thực tế sau biến điệu (dữ liệu luôn ghi thanh gốc) */
  sandhi?: boolean;
  /** chữ Hán tương ứng — giúp nhận diện 一/不 khi tính biến điệu */
  hanzi?: string;
  className?: string;
}

export function PinyinText({ pinyin, colored = true, sandhi = false, hanzi, className }: PinyinTextProps) {
  const words = pinyin.trim().split(/\s+/);
  // dữ liệu từ vựng: mỗi token đã là 1 âm tiết; câu: tách tiếp từng từ
  const syllables = words.flatMap((w) => splitSyllables(w));
  const shown = sandhi ? sandhiSyllables(syllables, hanzi ? [...hanzi] : undefined) : syllables;
  const spaced = words.length === syllables.length;

  return (
    <span className={cn("font-pinyin font-semibold", className)} lang="zh-Latn-pinyin">
      {shown.map((s, i) => (
        <span key={i} className={colored ? TONE_CLASS[toneOf(s)] : undefined}>
          {s}
          {spaced && i < shown.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
