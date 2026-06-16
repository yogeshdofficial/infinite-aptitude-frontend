import type React from "react";
import { KonstaProvider } from "konsta/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ProviderProps {
  children: React.ReactNode;
}

export default function Provider({ children }: ProviderProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <KonstaProvider theme="parent">{children}</KonstaProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}
