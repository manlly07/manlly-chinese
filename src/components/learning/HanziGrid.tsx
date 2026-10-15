/** Lưới 米字格 làm nền ô tập viết. */
export function HanziGrid() {
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full text-primary/25" aria-hidden>
      <rect x="1" y="1" width="98" height="98" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <g stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3">
        <line x1="0" y1="50" x2="100" y2="50" />
        <line x1="50" y1="0" x2="50" y2="100" />
        <line x1="0" y1="0" x2="100" y2="100" />
        <line x1="100" y1="0" x2="0" y2="100" />
      </g>
    </svg>
  );
}
