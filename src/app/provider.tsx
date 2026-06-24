import type React from "react";
import { KonstaProvider } from "konsta/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
interface ProviderProps {
  children: React.ReactNode;
}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
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
