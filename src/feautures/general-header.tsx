import { Link, useLocation } from "react-router-dom";
import { IonHeader, IonToolbar } from "@ionic/react";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LuChevronRight } from "react-icons/lu";
import clsx from "clsx";

interface GeneralHeaderProps {
  title?: string;
}

const NAV_LINKS = [
  { to: "/tabs/browse", label: "Browse" },
  { to: "/tabs/practice", label: "Practice" },
  { to: "/tabs/patterns", label: "Patterns" },
  { to: "/tabs/progress", label: "Progress" },
];

/** Derive the active top-level nav item from the current path. */
function useActiveSection() {
  const { pathname } = useLocation();
  return NAV_LINKS.find(({ to }) =>
    to !== "/tabs/browse"
      ? pathname.startsWith(to)
      : pathname === to,
  )?.label ?? null;
}

/**
 * On deep pages (e.g. chapter → learn), show a lightweight breadcrumb so
 * users can jump back without using the hardware back button. Only rendered
 * on desktop (hidden md:flex).
 */
function DesktopBreadcrumb({ title }: { title?: string }) {
  const { pathname } = useLocation();
  const section = useActiveSection();

  // Breadcrumb is only meaningful on pages deeper than the tab root
  const isDeep =
    title &&
    section &&
    !NAV_LINKS.some((n) => n.to === pathname);

  if (!isDeep) return null;

  // Find the parent tab link
  const parent = NAV_LINKS.find(({ to }) =>
    to !== "/tabs/browse" ? pathname.startsWith(to) : false,
  );

  if (!parent) return null;

  return (
    <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
      <Link
        to={parent.to}
        className="hover:text-foreground transition-colors truncate max-w-[120px]"
      >
        {parent.label}
      </Link>
      <LuChevronRight className="size-3 shrink-0" />
      <span className="text-foreground font-medium truncate max-w-[180px]">
        {title}
      </span>
    </div>
  );
}

export default function GeneralHeader({ title }: Readonly<GeneralHeaderProps>) {
  const location = useLocation();

  return (
    <>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="flex h-14 items-center justify-between px-4 md:px-6 border-b border-border/60">
            {/* Brand */}
            <Link
              to="/tabs/browse"
              className="font-heading text-base font-semibold tracking-tight shrink-0"
            >
              Infinite Aptitude
            </Link>

            {/* Center — nav links on desktop */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label }) => {
                const active =
                  location.pathname === to ||
                  (to !== "/tabs/browse" &&
                    location.pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={clsx(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Right side — breadcrumb on deep pages, mode toggle always */}
            <div className="flex items-center gap-3 shrink-0">
              <DesktopBreadcrumb title={title} />
              <ModeToggle />
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* Mobile bottom tab bar */}
      <MobileBottomNav />
    </>
  );
}
