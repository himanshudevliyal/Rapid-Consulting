"use client";

import { NavMain } from "@/components/nav-main";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { sidebarData } from "@/data/routes";
import { useAuth } from "@/providers/auth-provider";
import { useMemo } from "react";
import { ScrollArea } from "./ui/scroll-area";
import SideHeader from "./sidebar-header";

export function AppSidebar({ ...props }) {
  const { user } = useAuth();
  const filteredRoutes = useMemo(() => {
    return sidebarData
      .filter((route) => route.roles.includes(user?.role))
      .map((item) => {
        return {
          ...item,
          items: item.items.filter(
            (item) => item.roles.includes(user?.role) && item.isVisible,
          ),
        };
      });
  }, [user]);

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SideHeader />
      <SidebarContent className="overflow-x-hidden">
        <ScrollArea className="h-full">
          <NavMain items={filteredRoutes} />
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
