import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Mascot } from "@/components/learning/Mascot";
import { Toaster } from "@/components/ui/sonner";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useThemeSync } from "./use-theme";

function PageFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Đang tải">
      <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export function AppShell() {
  useThemeSync();
  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Bỏ qua tới nội dung
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur md:justify-end">
          <span className="flex items-center gap-1.5 font-black text-primary md:hidden">
            <Mascot className="size-10" />
            Manlly <span className="hanzi">中文</span>
          </span>
          <ThemeToggle />
        </header>
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:px-8 md:pb-10">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <MobileNav />
      <Toaster position="bottom-right" mobileOffset={{ bottom: 80 }} />
    </div>
  );
}
