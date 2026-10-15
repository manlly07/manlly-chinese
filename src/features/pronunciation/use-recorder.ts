import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "processing" | "denied" | "unsupported";

export const isRecordingSupported = () =>
  typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

/**
 * Ghi âm micro bằng MediaRecorder. Bản ghi chỉ nằm trong bộ nhớ (Blob + object URL),
 * không lưu, không gửi đi đâu; URL cũ được thu hồi khi ghi bản mới hoặc rời trang.
 */
export function useRecorder(maxMs: number, onDone: (blob: Blob) => void) {
  const [status, setStatus] = useState<RecorderStatus>(() => (isRecordingSupported() ? "idle" : "unsupported"));
  const [url, setUrl] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<number>();
  const raf = useRef<number>();
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const cleanupMeter = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setLevel(0);
  };

  const stop = useCallback(() => {
    window.clearTimeout(timer.current);
    if (rec.current?.state === "recording") rec.current.stop();
  }, []);

  const start = useCallback(async () => {
    if (!isRecordingSupported() || rec.current?.state === "recording") return;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setStatus("denied");
      return;
    }
    const chunks: Blob[] = [];
    const mr = new MediaRecorder(stream);
    rec.current = mr;

    // đồng hồ mức âm để người dùng thấy micro đang nghe
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
      setLevel(Math.min(1, peak / 64));
      raf.current = requestAnimationFrame(tick);
    };
    tick();

    mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    mr.onstop = () => {
      cleanupMeter();
      void ctx.close();
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
      setUrl(URL.createObjectURL(blob));
      setStatus("processing");
      onDoneRef.current(blob);
    };
    mr.start();
    setStatus("recording");
    timer.current = window.setTimeout(stop, maxMs);
  }, [maxMs, stop]);

  const reset = useCallback(() => {
    setUrl(null);
    setStatus((s) => (s === "unsupported" ? s : "idle"));
  }, []);

  // xử lý xong (do component gọi) → về idle
  const done = useCallback(() => setStatus((s) => (s === "processing" ? "idle" : s)), []);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      if (raf.current) cancelAnimationFrame(raf.current);
      if (rec.current?.state === "recording") {
        rec.current.onstop = null;
        rec.current.stream.getTracks().forEach((t) => t.stop());
        rec.current.stop();
      }
    },
    [],
  );
  // thu hồi URL cũ khi có bản ghi mới / rời trang
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);

  return { status, url, level, start, stop, reset, done };
}
