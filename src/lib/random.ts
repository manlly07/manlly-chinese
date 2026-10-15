export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Lấy n phần tử khác nhau (khác `exclude`) theo `key`. */
export function sampleDistinct<T>(arr: readonly T[], n: number, key: (x: T) => string, exclude: string[] = []): T[] {
  const seen = new Set(exclude);
  const out: T[] = [];
  for (const x of shuffle(arr)) {
    const k = key(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
    if (out.length === n) break;
  }
  return out;
}
