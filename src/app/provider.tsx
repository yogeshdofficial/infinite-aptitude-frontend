import type React from "react";
import { KonstaProvider } from "konsta/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
interface ProviderProps {
  children: React.ReactNode;
}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * All data lives in a read-only SQLite database that never changes at runtime.
 * Setting staleTime and gcTime to Infinity means React Query will:
 *   - Never consider a result "stale" → no background refetches
 *   - Never evict a cached entry → every screen transition is instant after
 *     the first load, with zero extra DB hits
 *
 * The in-memory dbCache in lib/db-cache.ts provides a second caching layer
 * below React Query for the rare case where an entry is evicted.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,          // static data — never re-fetch
      gcTime: Infinity,             // keep in memory for the whole session
      refetchOnWindowFocus: false,  // no point checking a local DB on focus
      retry: 1,
    },
  },
});

export default function Provider({ children }: Readonly<ProviderProps>) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <KonstaProvider theme="parent">{children}</KonstaProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
