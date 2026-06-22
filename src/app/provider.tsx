import type React from "react";
import { KonstaProvider } from "konsta/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
interface ProviderProps {
  children: React.ReactNode;
}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
export default function Provider({ children }: Readonly<ProviderProps>) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <KonstaProvider theme="parent">{children}</KonstaProvider>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
