import { MoreHorizontal } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { CuteIcon } from "@/components/learning/CuteIcon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav";

const itemClass = (active: boolean) =>
  cn(
    "group flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
    active ? "text-candy-pink-foreground" : "text-muted-foreground",
  );

const iconPill = (active: boolean) =>
  cn("flex h-8 w-12 items-center justify-center rounded-full transition-all", active && "-translate-y-0.5 bg-candy-pink");

export function MobileNav() {
  const main = NAV_ITEMS.filter((i) => i.mobile);
  const more = NAV_ITEMS.filter((i) => !i.mobile);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const moreActive = more.some((i) => pathname.startsWith(i.path));

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-40 flex rounded-t-3xl border-t border-border/70 bg-card/95 shadow-soft pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {main.map(({ label, path, icon }) => (
        <NavLink key={path} to={path} end={path === "/"} className={({ isActive }) => itemClass(isActive)}>
          {({ isActive }) => (
            <>
              <span className={iconPill(isActive)}>
                <CuteIcon name={icon} className="size-7" />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
      <div className="flex flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger className={itemClass(moreActive)}>
            <span className={iconPill(moreActive)}>
              <MoreHorizontal className="size-5" aria-hidden />
            </span>
            Thêm
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-52">
            {more.map(({ label, path, icon }) => (
              <DropdownMenuItem key={path} onSelect={() => navigate(path)}>
                <CuteIcon name={icon} className="!size-7" />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
