import { Link, useLocation } from "react-router-dom";
import {
  LuDumbbell,
  LuBookOpen,
  LuLayoutGrid,
  LuChartBar,
} from "react-icons/lu";
import clsx from "clsx";

const TABS = [
  { to: "/tabs/browse", label: "Browse", icon: LuBookOpen },
  { to: "/tabs/practice", label: "Practice", icon: LuDumbbell },
  { to: "/tabs/patterns", label: "Patterns", icon: LuLayoutGrid },
  { to: "/tabs/progress", label: "Progress", icon: LuChartBar },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/60 mobile-bottom-nav">
      <div className="flex items-center">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active =
            location.pathname === to ||
            (to !== "/tabs/browse" && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon
                className={clsx(
                  "size-5 transition-transform",
                  active && "scale-110",
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
