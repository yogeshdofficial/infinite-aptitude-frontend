/**
 * Rendered directly into #root, before the SQLite connection (and therefore
 * the rest of the app — every page reads from it) is ready. Deliberately
 * has zero dependencies on Ionic/React Query/etc. so it can never itself
 * fail to render.
 */
export function BootSplash() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <p className="text-sm text-muted-foreground">Loading question bank…</p>
    </div>
  );
}

export function BootError({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <div>
        <p className="text-sm font-medium">Couldn't open the local database</p>
        <p className="mt-1.5 max-w-xs text-xs text-muted-foreground">
          This usually clears up on a retry. If it keeps happening, try
          reinstalling the app.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
