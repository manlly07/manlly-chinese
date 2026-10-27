import { Check, FilePlus2, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SavedWorksheet } from "@/lib/repository";
import { cn } from "@/lib/utils";
import type { WorksheetDoc } from "@/store/session";

interface Props {
  doc: WorksheetDoc;
  saved: SavedWorksheet[];
  onSave: () => void;
  onNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const when = (t: number) =>
  new Date(t).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

/** Vở đã lưu: lưu vở đang soạn, mở lại, xoá; vở mới. */
export function SavedWorksheets({ doc, saved, onSave, onNew, onOpen, onDelete }: Props) {
  const [confirm, setConfirm] = useState<{ kind: "delete"; ws: SavedWorksheet } | { kind: "new" } | null>(null);
  const unsaved = !doc.id && doc.words.length > 0;
  const list = [...saved].sort((a, b) => b.updatedAt - a.updatedAt);
  const current = doc.id ? saved.find((w) => w.id === doc.id) : undefined;

  return (
    <div className="space-y-3">
      {current ? (
        <p className="flex items-start gap-2 rounded-2xl bg-candy-mint p-3 text-sm font-bold text-candy-mint-foreground">
          <Check className="mt-0.5 size-4 shrink-0" />
          <span>
            Đã lưu — mọi thay đổi tự lưu ngay.
            <span className="block text-xs font-semibold opacity-80">Lần cuối: {when(current.updatedAt)}</span>
          </span>
        </p>
      ) : (
        <p className="text-sm font-semibold text-muted-foreground">
          {unsaved ? "Vở này chưa lưu — tải lại trang sẽ mất." : "Thêm từ rồi lưu vở để lần sau mở lại."}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!doc.id && (
          <Button onClick={onSave} disabled={!doc.words.length}>
            <Save /> Lưu vở
          </Button>
        )}
        <Button variant="outline" onClick={() => (unsaved ? setConfirm({ kind: "new" }) : onNew())} disabled={!doc.id && !doc.words.length}>
          <FilePlus2 /> Vở mới
        </Button>
      </div>

      {list.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-black">Vở đã lưu ({list.length})</p>
          <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {list.map((w) => {
              const open = w.id === doc.id;
              return (
                <li key={w.id} className={cn("flex items-center gap-1 rounded-2xl p-1 pl-3", open ? "bg-primary/10 ring-2 ring-primary" : "bg-muted/60")}>
                  <button
                    type="button"
                    onClick={() => onOpen(w.id)}
                    disabled={open}
                    className="min-w-0 flex-1 rounded-xl py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Mở vở ${w.title}`}
                  >
                    <span className="block truncate text-sm font-black">{w.title || "Không tên"}</span>
                    <span className="block truncate text-xs font-semibold text-muted-foreground">
                      {open ? "Đang mở · " : ""}
                      {w.words.length} từ · <span className="hanzi">{w.words.slice(0, 6).map((x) => x.hanzi).join(" ")}</span>
                      {w.words.length > 6 ? " …" : ""}
                    </span>
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirm({ kind: "delete", ws: w })} aria-label={`Xoá vở ${w.title}`}>
                    <Trash2 />
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm?.kind === "delete" ? `Xoá vở “${confirm.ws.title}”?` : "Bỏ vở chưa lưu?"}</DialogTitle>
            <DialogDescription>
              {confirm?.kind === "delete"
                ? `Vở có ${confirm.ws.words.length} từ sẽ bị xoá khỏi danh sách đã lưu. Không thể hoàn tác.`
                : "Vở đang soạn chưa được lưu. Tạo vở mới sẽ bỏ danh sách từ hiện tại."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Huỷ
            </Button>
            {confirm?.kind === "new" && (
              <Button
                variant="outline"
                onClick={() => {
                  onSave();
                  onNew();
                  setConfirm(null);
                }}
              >
                Lưu rồi tạo mới
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm?.kind === "delete") onDelete(confirm.ws.id);
                else onNew();
                setConfirm(null);
              }}
            >
              {confirm?.kind === "delete" ? "Xoá vở" : "Bỏ & tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
