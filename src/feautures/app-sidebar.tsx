import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import { LuBookOpenText, LuDumbbell, LuLoader } from "react-icons/lu";

export default function AppSidebar() {
  const location = useLocation();

  const { data: chapters = [] } = useQuery({
    queryKey: ["chapters"],
    queryFn: () => chapterRepository.getAll(),
  });

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-3">
        <span className="font-heading text-sm font-semibold">Infinite Aptitude</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/tabs/practice"}>
                  <Link to="/tabs/practice">
                    <LuDumbbell />
                    <span>Practice</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/tabs/patterns"}>
                  <Link to="/tabs/patterns">
                    <LuBookOpenText />
                    <span>Patterns</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/tabs/progress"}>
                  <Link to="/tabs/progress">
                    <LuLoader />
                    <span>Progress</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Chapters</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chapters.map((chapter) => (
                <SidebarMenuItem key={chapter.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === `/tabs/practice/${chapter.id}`}
                  >
                    <Link to={`/tabs/practice/${chapter.id}`}>
                      <span>{chapter.display_name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
