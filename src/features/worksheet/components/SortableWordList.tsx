import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SheetWord } from "@/lib/worksheet";

interface Props {
  words: SheetWord[];
  onChange: (words: SheetWord[]) => void;
}

/** Danh sách từ trong vở: kéo tay nắm (chuột, cảm ứng, hoặc Space + ↑↓) để đổi thứ tự; sửa pinyin/nghĩa; bỏ từ. */
export function SortableWordList({ words, onChange }: Props) {
  const sensors = useSensors(
    // kéo quá 4 px mới tính là kéo — chạm nhẹ vào tay nắm không làm xê dịch
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = words.map((w) => w.hanzi);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(words, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };
  const update = (i: number, patch: Partial<SheetWord>) => onChange(words.map((w, k) => (k === i ? { ...w, ...patch } : w)));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={onDragEnd}
      accessibility={{
        screenReaderInstructions: { draggable: "Nhấn Space để cầm từ, ↑ ↓ để di chuyển, Space để thả, Esc để huỷ." },
        announcements: {
          onDragStart: ({ active }) => `Đã cầm ${active.id}.`,
          onDragOver: ({ active, over }) => (over ? `${active.id} sang vị trí ${ids.indexOf(String(over.id)) + 1}.` : ""),
          onDragEnd: ({ active, over }) => (over ? `Đã thả ${active.id} ở vị trí ${ids.indexOf(String(over.id)) + 1}.` : ""),
          onDragCancel: ({ active }) => `Huỷ di chuyển ${active.id}.`,
        },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {words.map((w, i) => (
            <Item key={w.hanzi} word={w} index={i} onUpdate={(p) => update(i, p)} onRemove={() => onChange(words.filter((_, k) => k !== i))} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function Item({ word: w, index, onUpdate, onRemove }: { word: SheetWord; index: number; onUpdate: (p: Partial<SheetWord>) => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: w.hanzi });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("relative flex items-start gap-1 rounded-2xl bg-muted/60 p-2", isDragging && "z-10 bg-card shadow-soft ring-2 ring-primary")}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Kéo để đổi vị trí ${w.hanzi} (đang ở vị trí ${index + 1})`}
        title="Kéo để đổi vị trí"
        className="flex h-16 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-muted-foreground hover:bg-muted active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="hanzi w-12 shrink-0 pt-1 text-center text-2xl">{w.hanzi}</span>
      <div className="grid min-w-0 flex-1 gap-1">
        <Input value={w.pinyin} onChange={(e) => onUpdate({ pinyin: e.target.value })} placeholder="pinyin (nǐ hǎo)" className="font-pinyin h-8 text-sm" aria-label={`Pinyin của ${w.hanzi}`} />
        <Input value={w.meaning} onChange={(e) => onUpdate({ meaning: e.target.value })} placeholder="nghĩa tiếng Việt" className="h-8 text-sm" aria-label={`Nghĩa của ${w.hanzi}`} />
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Bỏ ${w.hanzi}`}>
        <X />
      </Button>
    </li>
  );
}
