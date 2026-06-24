import { Link, useLocation } from "react-router-dom";
import { IonHeader, IonToolbar } from "@ionic/react";
import { ModeToggle } from "@/components/mode-toggle";
import clsx from "clsx";

interface GeneralHeaderProps {
  title?: string;
}

const NAV_LINKS = [
  { to: "/tabs/practice", label: "Practice" },
  { to: "/tabs/browse", label: "Browse" },
  { to: "/tabs/patterns", label: "Patterns" },
  { to: "/tabs/progress", label: "Progress" },
];

export default function GeneralHeader({ title }: Readonly<GeneralHeaderProps>) {
  const location = useLocation();

  return (
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <div className="flex h-14 items-center justify-between px-6 border-b border-border/60">
          {/* Brand */}
          <Link
            to="/tabs/practice"
            className="font-heading text-base font-semibold tracking-tight shrink-0"
          >
            Infinite Aptitude
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const active =
                location.pathname === to ||
                (to !== "/tabs/practice" && location.pathname.startsWith(to));
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
              <span className="hidden lg:block text-sm text-muted-foreground">
                {title}
              </span>
            )}
            <ModeToggle />
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
}
