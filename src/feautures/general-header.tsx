import { Link, useLocation } from "react-router-dom";
import { IonHeader, IonToolbar } from "@ionic/react";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileBottomNav } from "@/components/MobileBottomNav";
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

            {/* Nav links — desktop only */}
            <nav className="hidden md:flex items-center gap-1">
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
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              {title && (
                <span className="hidden lg:block text-sm text-muted-foreground max-w-48 truncate">
                  {title}
                </span>
              )}
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
