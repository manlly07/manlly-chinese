import { Download, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { downloadBlob, type ExportFile, exportFileName, ImportError, progressRepository } from "@/lib/repository";
import { progressSnapshot, useProgress } from "@/store/progress";
import { settingsSnapshot, useSettings } from "@/store/settings";

export function DataSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ExportFile | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const importData = useProgress((s) => s.importData);
  const resetAll = useProgress((s) => s.resetAll);
  const cardCount = useProgress((s) => Object.keys(s.cards).length);
  const xp = useProgress((s) => s.xp);

  const doExport = () => {
    downloadBlob(progressRepository.exportFile(progressSnapshot(), settingsSnapshot()), exportFileName());
    toast.success("Đã tải file sao lưu");
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPending(await progressRepository.parseImport(file));
    } catch (e) {
      toast.error(e instanceof ImportError ? e.message : "Không đọc được file.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const apply = (mode: "merge" | "replace") => {
    if (!pending) return;
    importData(pending.progress, mode);
    if (mode === "replace" && pending.settings) useSettings.getState().replace(pending.settings);
    setPending(null);
    setConfirmReplace(false);
    toast.success(mode === "merge" ? "Đã gộp dữ liệu" : "Đã khôi phục dữ liệu");
  };

  const pendingCards = pending ? Object.keys(pending.progress.cards).length : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Dữ liệu học chỉ lưu trên trình duyệt này ({cardCount} thẻ, {xp} XP). Hãy xuất file định kỳ để sao lưu hoặc chuyển sang máy khác.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={doExport}>
          <Download /> Xuất dữ liệu
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload /> Nhập dữ liệu
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => void onFile(e.target.files?.[0])} />
        <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmReset(true)}>
          <Trash2 /> Xoá tiến độ
        </Button>
      </div>

      <Dialog open={!!pending} onOpenChange={(o) => !o && (setPending(null), setConfirmReplace(false))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmReplace ? "Thay thế toàn bộ dữ liệu?" : "Nhập dữ liệu"}</DialogTitle>
            <DialogDescription>
              {confirmReplace
                ? "Tiến độ hiện tại trên máy này sẽ bị thay bằng dữ liệu trong file. Không thể hoàn tác."
                : `File sao lưu ngày ${pending ? new Date(pending.exportedAt).toLocaleDateString("vi-VN") : ""}: ${pendingCards} thẻ, ${pending?.progress.xp ?? 0} XP. Bạn muốn gộp với dữ liệu hiện tại hay thay thế?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {confirmReplace ? (
              <>
                <Button variant="outline" onClick={() => setConfirmReplace(false)}>
                  Quay lại
                </Button>
                <Button variant="destructive" onClick={() => apply("replace")}>
                  Thay thế
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setConfirmReplace(true)}>
                  Thay thế
                </Button>
                <Button onClick={() => apply("merge")}>Gộp</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá toàn bộ tiến độ?</DialogTitle>
            <DialogDescription>
              Tất cả thẻ ôn tập, lịch sử và XP sẽ bị xoá. Bạn nên xuất dữ liệu trước. Không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
                toast("Đã xoá tiến độ");
              }}
            >
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
