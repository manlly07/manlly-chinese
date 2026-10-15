import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ThemeMode } from "@/lib/repository";
import { useSettings } from "@/store/settings";

const OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Theo hệ thống", icon: Monitor },
];

export function ThemeToggle() {
  const theme = useSettings((s) => s.theme);
  const set = useSettings((s) => s.set);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Đổi giao diện sáng/tối">
          <Sun className="size-5 dark:hidden" />
          <Moon className="hidden size-5 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem key={value} onSelect={() => set({ theme: value })} className={theme === value ? "font-semibold" : ""}>
            <Icon aria-hidden />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
