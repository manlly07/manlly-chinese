/** Âm thanh phản hồi nhỏ gọn bằng WebAudio (không tải file). */
let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.12) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = ctx.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export type Sfx = "correct" | "wrong" | "complete" | "combo";

export function playSfx(kind: Sfx) {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    return;
  }
  if (kind === "correct") {
    tone(660, 0, 0.12, "triangle");
    tone(990, 0.09, 0.18, "triangle");
  } else if (kind === "wrong") {
    tone(220, 0, 0.18, "square", 0.06);
    tone(180, 0.12, 0.22, "square", 0.06);
  } else if (kind === "combo") {
    [784, 988, 1175].forEach((f, i) => tone(f, i * 0.07, 0.16, "triangle", 0.1));
  } else {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25, "triangle", 0.12));
  }
}
