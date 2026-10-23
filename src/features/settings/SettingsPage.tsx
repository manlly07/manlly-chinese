import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { SettingsData } from "@/lib/repository";
import { useSettings } from "@/store/settings";
import { DataSection } from "./components/DataSection";
import { SettingRow, selectClass } from "./components/SettingRow";
import { VoiceSettings } from "./components/VoiceSettings";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">{children}</CardContent>
    </Card>
  );
}

function SelectSetting<K extends keyof SettingsData>({
  k,
  label,
  hint,
  options,
  parse = (v) => v as SettingsData[K],
}: {
  k: K;
  label: string;
  hint?: string;
  options: [SettingsData[K], string][];
  parse?: (v: string) => SettingsData[K];
}) {
  const value = useSettings((s) => s[k]);
  const set = useSettings((s) => s.set);
  return (
    <SettingRow label={label} hint={hint} htmlFor={`set-${k}`}>
      <select
        id={`set-${k}`}
        className={selectClass}
        value={String(value)}
        onChange={(e) => set({ [k]: parse(e.target.value) } as Partial<SettingsData>)}
      >
        {options.map(([v, l]) => (
          <option key={String(v)} value={String(v)}>
            {l}
          </option>
        ))}
      </select>
    </SettingRow>
  );
}

function SwitchSetting({ k, label, hint }: { k: "showPinyin" | "showHanViet" | "autoSpeak" | "soundEffects"; label: string; hint?: string }) {
  const value = useSettings((s) => s[k]);
  const set = useSettings((s) => s.set);
  return (
    <SettingRow label={label} hint={hint} htmlFor={`set-${k}`}>
      <Switch id={`set-${k}`} checked={value} onCheckedChange={(v) => set({ [k]: v })} />
    </SettingRow>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader icon="settings" title="Cài đặt" description="Tuỳ chỉnh cách học và quản lý dữ liệu của bạn" />

      <Section title="Giao diện">
        <SelectSetting
          k="theme"
          label="Chế độ màu"
          options={[
            ["system", "Theo hệ thống"],
            ["light", "Sáng"],
            ["dark", "Tối"],
          ]}
        />
        <SelectSetting
          k="hanziSize"
          label="Kích thước chữ Hán"
          options={[
            ["sm", "Nhỏ"],
            ["md", "Vừa"],
            ["lg", "Lớn"],
          ]}
        />
        <SwitchSetting k="showPinyin" label="Hiện pinyin" />
        <SwitchSetting k="showHanViet" label="Hiện âm Hán Việt" hint="Ví dụ 学习 → học tập" />
      </Section>

      <Section title="Học tập">
        <SelectSetting
          k="hskStandard"
          label="Chuẩn HSK"
          hint="HSK 2.0 có 6 cấp, HSK 3.0 có 9 cấp"
          options={[
            ["2.0", "HSK 2.0 (1–6)"],
            ["3.0", "HSK 3.0 (1–9)"],
          ]}
        />
        <SelectSetting
          k="dailyGoalXp"
          label="Mục tiêu mỗi ngày"
          parse={Number}
          options={[
            [10, "10 XP — Nhẹ nhàng"],
            [30, "30 XP — Vừa phải"],
            [50, "50 XP — Chăm chỉ"],
            [100, "100 XP — Tăng tốc"],
          ]}
        />
        <SelectSetting k="newPerDay" label="Số từ mới mỗi ngày" parse={Number} options={[5, 10, 15, 20, 30].map((n) => [n, `${n} từ`])} />
        <SelectSetting
          k="reviewFront"
          label="Mặt trước thẻ ôn"
          options={[
            ["hanzi", "Chữ Hán"],
            ["meaning", "Nghĩa tiếng Việt"],
            ["audio", "Âm thanh"],
          ]}
        />
        <SwitchSetting k="autoSpeak" label="Tự đọc khi lật thẻ" />
        <SwitchSetting k="soundEffects" label="Âm thanh đúng / sai" hint="Tiếng “ting” khi đúng, combo khi đúng liên tiếp" />
      </Section>

      <Section title="Phát âm">
        <VoiceSettings />
      </Section>

      <Section title="Sao lưu & dữ liệu">
        <div className="py-3">
          <DataSection />
        </div>
      </Section>

      <Link
        to="/about"
        className="flex items-center justify-between rounded-lg border border-border/70 bg-card p-4 font-black shadow-soft transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>
          Giới thiệu
          <span className="block text-sm font-semibold text-muted-foreground">Nguồn dữ liệu, giấy phép và quyền riêng tư</span>
        </span>
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      </Link>
    </div>
  );
}
