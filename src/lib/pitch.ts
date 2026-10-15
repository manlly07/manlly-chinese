/**
 * Phân tích cao độ giọng nói (chạy hoàn toàn trên máy, không gửi âm thanh đi đâu).
 * YIN đơn giản trên tín hiệu 16 kHz → đường cao độ (semitone) → so với đường thanh chuẩn (thang Chao 1–5).
 */
import type { Tone } from "./pinyin";

export const PITCH_RATE = 16000;
const FRAME = 512; // 32 ms
const HOP = 160; // 10 ms
const MIN_HZ = 70;
const MAX_HZ = 500;
/** số semitone cho mỗi bậc Chao — giọng nói tiếng Trung trải khoảng 1 quãng tám cho 4 bậc */
const ST_PER_LEVEL = 3;

/** Một khung 10 ms: hz = null nếu không phải âm hữu thanh. */
export type PitchTrack = (number | null)[];

/** YIN cho một khung; trả về Hz hoặc null. */
function yin(buf: Float32Array, start: number, threshold = 0.15): number | null {
  const tauMin = Math.floor(PITCH_RATE / MAX_HZ);
  const tauMax = Math.floor(PITCH_RATE / MIN_HZ);
  const w = FRAME - tauMax;
  if (w <= 0) return null;
  const d = new Float32Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let j = 0; j < w; j++) {
      const diff = buf[start + j] - buf[start + j + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }
  // hiệu chuẩn tích luỹ (CMNDF)
  let running = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    running += d[tau];
    d[tau] = running ? (d[tau] * tau) / running : 1;
  }
  for (let tau = tauMin; tau < tauMax; tau++) {
    if (d[tau] < threshold) {
      while (tau + 1 < tauMax && d[tau + 1] < d[tau]) tau++;
      // nội suy parabol quanh cực tiểu
      const a = d[tau - 1], b = d[tau], c = d[tau + 1];
      const den = 2 * (a - 2 * b + c);
      const shift = den > 1e-9 ? Math.max(-1, Math.min(1, (a - c) / den)) : 0;
      const hz = PITCH_RATE / (tau + shift);
      return hz >= MIN_HZ && hz <= MAX_HZ ? hz : null;
    }
  }
  return null;
}

/** Đường cao độ từ tín hiệu mono 16 kHz. */
export function pitchTrack(samples: Float32Array): PitchTrack {
  const n = Math.max(0, Math.floor((samples.length - FRAME) / HOP) + 1);
  const rms = new Float32Array(n);
  let peak = 0;
  for (let f = 0; f < n; f++) {
    let s = 0;
    for (let j = 0; j < FRAME; j++) s += samples[f * HOP + j] ** 2;
    rms[f] = Math.sqrt(s / FRAME);
    peak = Math.max(peak, rms[f]);
  }
  const gate = Math.max(0.01, peak * 0.12);
  const raw: PitchTrack = [];
  for (let f = 0; f < n; f++) raw.push(rms[f] >= gate ? yin(samples, f * HOP) : null);
  return cleanTrack(raw);
}

/** Bỏ nhảy quãng tám, lọc trung vị 5 khung, bỏ đoạn hữu thanh quá ngắn (< 40 ms). */
export function cleanTrack(track: PitchTrack): PitchTrack {
  const voiced = track.filter((x): x is number => x !== null);
  if (!voiced.length) return track.map(() => null);
  const med = median(voiced);
  const folded = track.map((hz) => {
    if (hz === null) return null;
    let h = hz;
    for (let k = 0; k < 3 && h > med * 1.8; k++) h /= 2;
    for (let k = 0; k < 3 && h < med * 0.55; k++) h *= 2;
    return h;
  });
  const smooth = folded.map((hz, i) => {
    if (hz === null) return null;
    const win = folded.slice(Math.max(0, i - 2), i + 3).filter((x): x is number => x !== null);
    return median(win);
  });
  // bỏ các đoạn hữu thanh ngắn (tiếng lách cách, hơi thở)
  const out = [...smooth];
  let i = 0;
  while (i < out.length) {
    if (out[i] === null) { i++; continue; }
    let j = i;
    while (j < out.length && out[j] !== null) j++;
    if (j - i < 4) for (let k = i; k < j; k++) out[k] = null;
    i = j;
  }
  return out;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const toSt = (hz: number) => 12 * Math.log2(hz / 100);

/** Cắt bỏ khoảng lặng hai đầu, giữ lại các khung trong vùng nói. */
export function trimTrack(track: PitchTrack): PitchTrack {
  const first = track.findIndex((x) => x !== null);
  if (first < 0) return [];
  let last = track.length - 1;
  while (track[last] === null) last--;
  return track.slice(first, last + 1);
}

/** Chia vùng nói thành `n` âm tiết: ưu tiên theo khoảng lặng, nếu không khớp thì chia đều. */
export function segmentSyllables(track: PitchTrack, n: number): PitchTrack[] {
  const t = trimTrack(track);
  if (n <= 1 || !t.length) return [t];
  const runs: [number, number][] = [];
  let i = 0;
  while (i < t.length) {
    if (t[i] === null) { i++; continue; }
    let j = i;
    // gộp các lỗ hổng ngắn (< 30 ms) vào cùng một đoạn
    while (j < t.length && (t[j] !== null || t.slice(j, j + 3).some((x) => x !== null))) j++;
    runs.push([i, j]);
    i = j;
  }
  if (runs.length === n) return runs.map(([a, b]) => t.slice(a, b));
  const size = t.length / n;
  return Array.from({ length: n }, (_, k) => t.slice(Math.round(k * size), Math.round((k + 1) * size)));
}

/** Ước lượng thanh của một âm tiết từ hình dạng đường cao độ. null = không đủ dữ liệu. */
export function classifyTone(seg: PitchTrack): Tone | null {
  const st = seg.filter((x): x is number => x !== null).map(toSt);
  if (st.length < 6) return null;
  const k = Math.max(2, Math.round(st.length * 0.2));
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const start = avg(st.slice(0, k));
  const end = avg(st.slice(-k));
  let minI = 0;
  st.forEach((v, i) => v < st[minI] && (minI = i));
  const min = st[minI];
  const max = Math.max(...st);
  const minPos = minI / (st.length - 1);
  const delta = end - start;

  if (max - min < 1.8) return 1;
  if (minPos > 0.2 && minPos < 0.85 && start - min > 1 && end - min > 1.5) return 3;
  if (delta <= -2 && minPos >= 0.5) return 4;
  if (delta >= 1.5 && minPos <= 0.55) return 2;
  return null;
}

export interface ContourPoint {
  /** 0–1 theo thời gian */
  x: number;
  /** bậc Chao (≈1–5) */
  y: number;
}

/** Đường thanh chuẩn cho dãy thanh (mỗi âm tiết chiếm một khoảng thời gian bằng nhau). */
export function targetContour(tones: Tone[], contourOf: (t: Tone) => number[]): ContourPoint[][] {
  return tones.map((t, i) => {
    const c = t === 5 ? [2.5, 2] : contourOf(t);
    const pts = c.length === 1 ? [c[0], c[0]] : c;
    const x0 = i / tones.length + 0.08 / tones.length;
    const x1 = (i + 1) / tones.length - 0.08 / tones.length;
    const span = t === 5 ? (x1 - x0) * 0.5 : x1 - x0;
    return pts.map((y, j) => ({ x: x0 + (span * j) / (pts.length - 1), y }));
  });
}

/**
 * Đặt đường cao độ của người nói lên thang Chao, căn trung bình theo đường mẫu
 * (cao độ tuyệt đối khác nhau theo giọng — chỉ so hình dạng). Trả về các đoạn liền mạch.
 */
export function userContour(track: PitchTrack, targetMean: number, syllables = 1): ContourPoint[][] {
  // cùng lề hai đầu với targetContour
  const pad = 0.08 / syllables;
  const t = trimTrack(track);
  const st = t.map((hz) => (hz === null ? null : toSt(hz)));
  const voiced = st.filter((x): x is number => x !== null);
  if (voiced.length < 4) return [];
  const mean = voiced.reduce((a, b) => a + b, 0) / voiced.length;
  const out: ContourPoint[][] = [];
  let cur: ContourPoint[] = [];
  st.forEach((v, i) => {
    if (v === null) {
      if (cur.length) out.push(cur);
      cur = [];
      return;
    }
    const y = Math.min(5.6, Math.max(0.4, targetMean + (v - mean) / ST_PER_LEVEL));
    cur.push({ x: t.length > 1 ? pad + (i / (t.length - 1)) * (1 - 2 * pad) : 0.5, y });
  });
  if (cur.length) out.push(cur);
  return out.filter((s) => s.length > 1);
}

/** Trung bình bậc Chao của đường mẫu (để căn đường người nói). */
export function contourMean(target: ContourPoint[][]): number {
  const ys = target.flat().map((p) => p.y);
  return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : 3;
}

/** Giải mã bản ghi (Blob từ MediaRecorder) thành mono 16 kHz. */
export async function decodeToMono16k(blob: Blob): Promise<Float32Array> {
  const buf = await blob.arrayBuffer();
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const audio = await ctx.decodeAudioData(buf);
    const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(audio.duration * PITCH_RATE)), PITCH_RATE);
    const src = off.createBufferSource();
    src.buffer = audio;
    src.connect(off.destination);
    src.start();
    const out = await off.startRendering();
    return out.getChannelData(0);
  } finally {
    void ctx.close();
  }
}
