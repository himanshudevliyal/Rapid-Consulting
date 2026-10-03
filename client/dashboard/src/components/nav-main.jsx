"use client";

import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "./ui/skeleton";
import { sidebarData } from "@/data/routes";
import { usePathname } from "next/navigation";

export function NavMain({ items }) {
  const { isUserLoading } = useAuth();
  const pathname = usePathname();
  return (
    <SidebarGroup className={"group-data-[collapsible=icon]:p-0"}>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu className={"group-data-[collapsible=icon]:gap-0"}>
        {isUserLoading
          ? Array.from({ length: sidebarData.length }).map((_, ind) => (
              <Skeleton className={"h-8"} key={ind} />
            ))
          : items.map((item, ind) => (
              <Collapsible
                key={ind}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <Link href={item.url}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url.split("?")[0]}
                        className={
                          "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-20! group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none group-data-[collapsible=icon]:p-px!"
                        }
                      >
                        {item.icon && (
                          <item.icon className="group-data-[collapsible=icon]:size-5" />
                        )}
                        <span className="group-data-[collapsible=icon]:text-center! group-data-[collapsible=icon]:text-xs group-data-[collapsible=icon]:leading-3 group-data-[collapsible=icon]:whitespace-normal!">
                          {item.title}
                        </span>
                        {item.items.length > 0 && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </Link>
                  </CollapsibleTrigger>
                  {item.items?.length > 0 && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname.includes(
                                subItem.url.split("?")[0],
                              )}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
