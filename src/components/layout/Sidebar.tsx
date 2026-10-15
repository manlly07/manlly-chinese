import { NavLink } from "react-router-dom";
import { CuteIcon } from "@/components/learning/CuteIcon";
import { Mascot } from "@/components/learning/Mascot";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card/80 backdrop-blur md:flex">
      <NavLink to="/" className="flex items-center gap-2 px-4 py-4">
        <Mascot className="size-14" />
        <span className="text-xl font-black leading-tight text-primary">
          Manlly <span className="hanzi">中文</span>
          <span className="block text-xs font-semibold text-muted-foreground">Từ số 0 đến thành thạo</span>
        </span>
      </NavLink>
      <nav aria-label="Điều hướng chính" className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {NAV_ITEMS.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-full px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-candy-pink text-candy-pink-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <CuteIcon name={icon} className="size-8 transition-transform group-hover:-rotate-6 group-hover:scale-110" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
