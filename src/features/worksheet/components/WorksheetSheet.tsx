import type { ReactNode } from "react";
import { hanChars } from "@/lib/content";
import type { StrokeData } from "@/lib/stroke-data";
import { chunk, practiceRows, type SheetWord } from "@/lib/worksheet";
import { GridCell, type GridStyle, type TraceStyle } from "./GridCell";

/** Thông tin hiển thị ở đầu trang luyện một chữ. */
export interface CharMeta {
  char: string;
  pinyin: string;
  hanViet: string;
  meaning: string;
  /** bộ thủ, vd "亻 nhân" */
  radical: string;
  /** từ có chứa chữ (组词) */
  words: string[];
}

export interface SheetOptions {
  grid: GridStyle;
  traceStyle: TraceStyle;
  /** số dòng chữ to / số dòng trong đó để tô */
  bigRows: number;
  bigTrace: number;
  smallRows: number;
  smallTrace: number;
}

interface Props {
  title: string;
  words: SheetWord[];
  chars: CharMeta[];
  strokes: Map<string, StrokeData | null>;
  options: SheetOptions;
}

// khổ A4 trừ lề 12 mm = 186 × 273 mm; mỗi hàng = số ô × cạnh + khe 0,6 mm giữa các ô (≤ 186 mm)
const BIG = { size: 22, perRow: 8 }; // 180,2 mm
const SMALL = { size: 12.5, perRow: 14 }; // 182,8 mm
const STEP = { size: 14.5, perRow: 12 }; // 180,6 mm

const countOf = (strokes: Map<string, StrokeData | null>, c: string) => strokes.get(c)?.strokes.length ?? 0;

function Row({ children }: { children: ReactNode }) {
  return <div className="flex" style={{ gap: "0.6mm" }}>{children}</div>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: "3.4mm", fontWeight: 800, margin: "4mm 0 1.5mm", color: "var(--paper-accent)" }}>{children}</p>;
}

function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ borderBottom: "0.3mm solid var(--paper-line)", paddingBottom: "2mm", marginBottom: "3mm" }}>
      <p style={{ fontSize: "2.8mm", letterSpacing: "0.4mm", color: "var(--paper-muted)", fontWeight: 700 }}>VỞ TẬP VIẾT TIẾNG TRUNG · MANLLY 中文</p>
      <p style={{ fontSize: "6mm", fontWeight: 900, marginTop: "1mm" }}>{title}</p>
      <p style={{ fontSize: "3.2mm", color: "var(--paper-muted)", fontWeight: 600 }}>{sub}</p>
    </div>
  );
}

function SelfCheck() {
  return (
    <p style={{ fontSize: "3mm", color: "var(--paper-muted)", fontWeight: 700, marginTop: "4mm" }}>
      Tự kiểm tra: ☐ Nhớ mặt chữ &nbsp;&nbsp; ☐ Viết đúng thứ tự nét &nbsp;&nbsp; ☐ Đọc đúng pinyin
    </p>
  );
}

/** Trang 1: bảng từ mới. */
function VocabPage({ title, words, strokes }: Pick<Props, "title" | "words" | "strokes">) {
  const cell = { border: "0.25mm solid var(--paper-line)", padding: "2mm 2.5mm", fontSize: "3.6mm" } as const;
  return (
    <section className="paper-page">
      <Header title={title} sub="Từ mới hôm nay · Nhìn chữ, đọc phiên âm, hiểu nghĩa rồi luyện viết." />
      <p style={{ fontSize: "3.4mm", fontWeight: 700, margin: "2mm 0 4mm" }}>
        Họ tên: ____________________________ &nbsp;&nbsp;&nbsp; Ngày: ____ / ____ / ______
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--paper-head)" }}>
            {["Chữ Hán", "Pinyin", "Nghĩa tiếng Việt", "Số nét"].map((h) => (
              <th key={h} style={{ ...cell, textAlign: "left", fontWeight: 800 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {words.map((w) => {
            const cs = hanChars(w.hanzi);
            return (
              <tr key={w.hanzi}>
                <td style={{ ...cell, fontSize: "7mm", textAlign: "center" }} className="hanzi">
                  {w.hanzi}
                </td>
                <td style={{ ...cell, fontFamily: "Mali, Nunito, sans-serif", fontWeight: 700 }}>{w.pinyin}</td>
                <td style={cell}>
                  {w.meaning}
                  {w.hanViet && <span style={{ display: "block", fontSize: "2.8mm", color: "var(--paper-muted)", textTransform: "uppercase", fontWeight: 700 }}>{w.hanViet}</span>}
                </td>
                <td style={{ ...cell, whiteSpace: "nowrap" }}>
                  {cs.length === 1 ? `${countOf(strokes, cs[0]) || "?"} nét` : cs.map((c) => `${c}: ${countOf(strokes, c) || "?"}`).join(" · ")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: "3.2mm", color: "var(--paper-muted)", fontWeight: 600, marginTop: "5mm" }}>
        Mỗi trang sau luyện một chữ: xem thứ tự nét → tô theo chữ mờ → tự viết. Chữ xuất hiện trong nhiều từ chỉ luyện một lần.
      </p>
    </section>
  );
}

/** Trang luyện một chữ: đầu trang → thứ tự nét → chữ to → chữ nhỏ. */
function CharPage({ meta, data, options, index, title }: { meta: CharMeta; data: StrokeData | null; options: SheetOptions; index: number; title: string }) {
  const n = data?.strokes.length ?? 0;
  const practice = (rows: number, trace: number, { size, perRow }: typeof BIG) =>
    practiceRows(rows, trace).map((r, k) => (
      <Row key={k}>
        {Array.from({ length: perRow }, (_, i) => (
          <GridCell
            key={i}
            size={size}
            grid={options.grid}
            char={meta.char}
            data={data}
            mode={i === 0 ? "model" : r.kind === "trace" ? "trace" : "blank"}
            traceStyle={options.traceStyle}
          />
        ))}
      </Row>
    ));

  return (
    <section className="paper-page">
      <Header title={`${title} · Chữ ${index + 1}: ${meta.char}`} sub={[meta.pinyin, meta.meaning].filter(Boolean).join(" · ")} />

      <div className="flex" style={{ gap: "4mm", alignItems: "stretch" }}>
        <div style={{ background: "var(--paper-head)", padding: "1.5mm", borderRadius: "1.5mm" }}>
          <GridCell size={26} grid={options.grid} char={meta.char} data={data} mode="model" />
        </div>
        <div style={{ fontSize: "3.4mm", lineHeight: 1.55 }}>
          <p style={{ fontFamily: "Mali, Nunito, sans-serif", fontSize: "5.5mm", fontWeight: 800 }}>{meta.pinyin || "—"}</p>
          {meta.hanViet && <p style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3mm" }}>Hán Việt: {meta.hanViet}</p>}
          {meta.meaning && <p>Nghĩa: {meta.meaning}</p>}
          <p>
            {n ? `${n} nét` : "Chưa tải được thứ tự nét"}
            {meta.radical && ` · Bộ ${meta.radical}`}
          </p>
          {meta.words.length > 0 && (
            <p>
              Từ có chữ này: <span className="hanzi">{meta.words.join("、")}</span>
            </p>
          )}
        </div>
      </div>

      {n > 0 && (
        <>
          <SectionTitle>① Thứ tự nét — nét mới tô đỏ</SectionTitle>
          <div style={{ display: "grid", gap: "0.6mm" }}>
            {chunk(Array.from({ length: n }, (_, i) => i), STEP.perRow).map((row, k) => (
              <Row key={k}>
                {row.map((i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <GridCell size={STEP.size} grid={options.grid} char={meta.char} data={data} mode="step" step={i} />
                    <span style={{ position: "absolute", top: "0.5mm", left: "1mm", fontSize: "2.2mm", color: "var(--paper-muted)", fontWeight: 700 }}>{i + 1}</span>
                  </div>
                ))}
              </Row>
            ))}
          </div>
        </>
      )}

      <SectionTitle>
        ② Chữ to · {options.bigTrace} dòng tô theo, {options.bigRows - options.bigTrace} dòng tự viết
      </SectionTitle>
      <div style={{ display: "grid", gap: "0.6mm" }}>{practice(options.bigRows, options.bigTrace, BIG)}</div>

      <SectionTitle>
        ③ Chữ nhỏ · {options.smallTrace} dòng tô theo, {options.smallRows - options.smallTrace} dòng tự viết
      </SectionTitle>
      <div style={{ display: "grid", gap: "0.6mm" }}>{practice(options.smallRows, options.smallTrace, SMALL)}</div>

      <SelfCheck />
    </section>
  );
}

/** Toàn bộ vở: trang từ mới + một trang cho mỗi chữ. Kích thước theo mm để in A4 đúng tỉ lệ. */
export function WorksheetSheet({ title, words, chars, strokes, options }: Props) {
  return (
    <div className="paper">
      <VocabPage title={title} words={words} strokes={strokes} />
      {chars.map((m, i) => (
        <CharPage key={m.char} meta={m} data={strokes.get(m.char) ?? null} options={options} index={i} title={title} />
      ))}
    </div>
  );
}
