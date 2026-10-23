import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Mascot } from "@/components/learning/Mascot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Source {
  name: string;
  url: string;
  use: string;
  license: string;
  licenseUrl: string;
  note?: ReactNode;
}

/** Dữ liệu dùng trong app — BẮT BUỘC ghi nguồn (docs/DATA.md §8). Thêm nguồn mới vào đây khi dùng. */
const DATA_SOURCES: Source[] = [
  {
    name: "Make Me a Hanzi — dictionary.txt",
    url: "https://github.com/skishore/makemeahanzi",
    use: "Cấu tạo chữ: các bộ của mỗi chữ, phần gợi nghĩa / gợi âm (bước “Bộ mới”, “Ghép chữ”, cấu tạo chữ).",
    license: "GNU LGPL 3.0",
    licenseUrl: "https://www.gnu.org/licenses/lgpl-3.0.html",
    note: (
      <>
        Dữ liệu gốc dẫn xuất từ Unihan (Unicode) và CJKlib. Phần trích ra trong app (<code>src/content/hanzi/chars.json</code>, sinh bằng{" "}
        <code>scripts/build-chars.mjs</code>) cũng được phân phối theo LGPL 3.0.
      </>
    ),
  },
  {
    name: "audio-cmn — âm tiết tiếng Trung",
    url: "https://github.com/hugolpz/audio-cmn",
    use: "Giọng đọc người bản ngữ cho từng âm tiết và thanh điệu (Bảng âm tiết, Ghép vần, bài tập pinyin).",
    license: "CC BY-SA",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    note: (
      <>
        Người đọc: Chen Wang. Dự án do Hugo Lopez (PLIDAM, INALCO) tổng hợp. File giữ nguyên nội dung, chỉ đổi tên — xem{" "}
        <code>public/audio/syllables/LICENSE.txt</code>.
      </>
    ),
  },
  {
    name: "hanzi-writer-data",
    url: "https://github.com/chanind/hanzi-writer-data",
    use: "Dữ liệu nét chữ cho hoạt ảnh thứ tự nét và tập viết — tải từ jsDelivr khi bạn mở chữ.",
    license: "Arphic Public License",
    licenseUrl: "https://github.com/chanind/hanzi-writer-data/blob/master/ARPHICPL.TXT",
    note: "Dẫn xuất từ phông Arphic PL KaitiM GB và Arphic PL UKai qua dự án Make Me a Hanzi.",
  },
];

const SOFTWARE: { name: string; url: string; license: string }[] = [
  { name: "Hanzi Writer", url: "https://hanziwriter.org", license: "MIT" },
  { name: "React", url: "https://react.dev", license: "MIT" },
  { name: "Radix UI & shadcn/ui", url: "https://www.radix-ui.com", license: "MIT" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com", license: "MIT" },
  { name: "Zustand", url: "https://github.com/pmndrs/zustand", license: "MIT" },
  { name: "Lucide icons", url: "https://lucide.dev", license: "ISC" },
  { name: "Sonner", url: "https://sonner.emilkowal.ski", license: "MIT" },
  { name: "Phông Nunito, Mali, Noto Serif SC (Google Fonts)", url: "https://fonts.google.com", license: "SIL Open Font License 1.1" },
];

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-bold text-primary underline-offset-2 hover:underline">
      {children}
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader icon="heart" title="Giới thiệu" description="Về Manlly 中文, nguồn dữ liệu và quyền riêng tư" />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <Mascot className="size-20 shrink-0" />
          <div className="space-y-1.5">
            <p className="text-lg font-black">Manlly 中文 — học tiếng Trung cho người Việt</p>
            <p className="font-semibold text-muted-foreground">
              Đi từ con số 0: học từng phụ âm đầu, vần, nét và bộ rồi tự ghép thành âm tiết, thành chữ. Có âm Hán Việt để bạn nhận ra chữ quen thuộc.
              Nghĩa tiếng Việt, âm Hán Việt, bài học, hội thoại và bài tập do nhóm Manlly tự biên soạn.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Nguồn dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DATA_SOURCES.map((s) => (
            <div key={s.name} className="space-y-1 rounded-2xl bg-muted/60 p-4">
              <p className="font-black">
                <A href={s.url}>{s.name}</A>
              </p>
              <p className="text-sm font-semibold">{s.use}</p>
              <p className="text-sm font-semibold text-muted-foreground">
                Giấy phép: <A href={s.licenseUrl}>{s.license}</A>
              </p>
              {s.note && <p className="text-xs font-semibold text-muted-foreground">{s.note}</p>}
            </div>
          ))}
          <p className="text-sm font-semibold text-muted-foreground">
            Danh sách từ theo cấp HSK soạn theo các danh sách công bố công khai. Câu hỏi luyện tập và kiểm tra do Manlly tự soạn, không sao chép đề thi thật.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Thư viện & phông chữ</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {SOFTWARE.map((s) => (
              <li key={s.name} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <A href={s.url}>{s.name}</A>
                <span className="font-semibold text-muted-foreground">{s.license}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quyền riêng tư</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm font-semibold">
          <p>Không cần tài khoản. Tiến độ học chỉ lưu trên trình duyệt của bạn — dùng “Sao lưu” trong Cài đặt để chuyển sang máy khác.</p>
          <p>Giọng đọc dùng giọng có sẵn trên máy. Bản ghi âm khi luyện nói chỉ được phân tích ngay trên máy, không lưu và không gửi đi đâu.</p>
          <p className="text-muted-foreground">
            App chỉ tải phông chữ từ Google Fonts và dữ liệu nét chữ từ jsDelivr; hai dịch vụ này có thể thấy địa chỉ IP của bạn như mọi trang web khác.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
