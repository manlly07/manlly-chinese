import { Check, Plus, Search } from "lucide-react";
import { type KeyboardEvent, useId, useMemo, useRef, useState } from "react";
import { PinyinText } from "@/components/learning/PinyinText";
import { Input } from "@/components/ui/input";
import { hanChars, type Word } from "@/lib/content";
import { searchWords } from "@/lib/search";
import { cn } from "@/lib/utils";
import { fromWord, parseCustom, type SheetWord } from "@/lib/worksheet";

interface Props {
  vocab: Word[];
  /** chữ Hán đã có trong vở — gợi ý hiện dấu ✓ */
  added: Set<string>;
  onAdd: (words: SheetWord[]) => void;
}

type Suggestion = { kind: "word"; word: Word } | { kind: "custom"; words: SheetWord[] };

const MAX = 8;

/**
 * Một ô tìm duy nhất: gõ tiếng Việt, chữ Hán hoặc pinyin → gợi ý ngay; bấm / ↑↓ + Enter để thêm.
 * Chữ Hán chưa có trong từ vựng vẫn thêm được (tự điền pinyin, nghĩa sau).
 */
export function WordSearch({ vocab, added, onAdd }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const suggestions = useMemo<Suggestion[]>(() => {
    const t = q.trim();
    if (!t) return [];
    const found: Suggestion[] = searchWords(vocab, t)
      .slice(0, MAX)
      .map((word) => ({ kind: "word", word }));
    // gõ chữ Hán (một hoặc nhiều từ cách nhau dấu cách) mà không khớp đúng từ có sẵn → cho thêm nguyên văn
    const custom = hanChars(t).length ? parseCustom(t, vocab) : [];
    const exact = custom.length === 1 && found.some((s) => s.kind === "word" && s.word.hanzi === custom[0].hanzi);
    return custom.length && !exact ? [{ kind: "custom", words: custom }, ...found] : found;
  }, [q, vocab]);

  const choose = (s: Suggestion) => {
    onAdd(s.kind === "word" ? [fromWord(s.word)] : s.words);
    setQ("");
    setActive(0);
    input.current?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(suggestions[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const show = open && q.trim().length > 0;
  const optionId = (i: number) => `${listId}-${i}`;

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-[22px] size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        ref={input}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKey}
        placeholder="xin chào · 老师 · laoshi · ni3"
        className="h-11 rounded-full pl-10"
        role="combobox"
        aria-label="Tìm từ để thêm: tiếng Việt, chữ Hán hoặc pinyin"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={show && suggestions.length ? optionId(active) : undefined}
      />
      {show && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-2xl border border-border/70 bg-popover p-1 shadow-soft"
          // giữ focus ở ô nhập khi bấm gợi ý (onBlur đóng danh sách)
          onMouseDown={(e) => e.preventDefault()}
        >
          {!suggestions.length ? (
            <li className="px-3 py-3 text-sm font-semibold text-muted-foreground">
              Không thấy từ phù hợp. Thử gõ pinyin (ni hao) hoặc dán chữ Hán (你好) để thêm nguyên văn.
            </li>
          ) : (
            suggestions.map((s, i) => {
              const isAdded = s.kind === "word" ? added.has(s.word.hanzi) : s.words.every((w) => added.has(w.hanzi));
              return (
                <li
                  key={s.kind === "word" ? s.word.id : "custom"}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  onClick={() => choose(s)}
                  onMouseEnter={() => setActive(i)}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2", i === active && "bg-muted")}
                >
                  {s.kind === "word" ? (
                    <>
                      <span className="hanzi min-w-10 text-xl">{s.word.hanzi}</span>
                      <span className="min-w-0 flex-1">
                        <PinyinText pinyin={s.word.pinyin} className="text-sm" />
                        <span className="block truncate text-sm font-semibold text-muted-foreground">
                          {s.word.meaning.slice(0, 2).join("; ")}
                          {s.word.hanViet && <span className="ml-1.5 text-xs uppercase">· {s.word.hanViet}</span>}
                        </span>
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">HSK {s.word.hsk2}</span>
                    </>
                  ) : (
                    <span className="min-w-0 flex-1 text-sm font-bold">
                      Thêm nguyên văn <span className="hanzi text-lg">{s.words.map((w) => w.hanzi).join(" ")}</span>
                      <span className="block text-xs font-semibold text-muted-foreground">Chưa có trong từ vựng — pinyin/nghĩa tự điền sau</span>
                    </span>
                  )}
                  {isAdded ? <Check className="size-4 text-candy-mint-foreground" aria-label="Đã thêm" /> : <Plus className="size-4 text-primary" aria-hidden />}
                </li>
              );
            })
          )}
        </ul>
      )}
      <p className="mt-1.5 text-xs font-semibold text-muted-foreground">↑ ↓ để chọn · Enter để thêm · gõ có dấu để tìm chính xác hơn</p>
    </div>
  );
}
