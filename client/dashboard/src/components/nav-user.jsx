"use client";

import { LogOut, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleLogout, useAuth } from "@/providers/auth-provider";
import { Skeleton } from "./ui/skeleton";
import { Muted, Small } from "./ui/typography";
import UserAvatar from "./user-avatar";
import { userRoles } from "@/data";

export function NavUser({}) {
  const { user, isUserLoading } = useAuth();

  if (isUserLoading) return <Skeleton className={"h-10 w-32.5"} />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="hover:cursor-pointer">
        <div className="flex items-center gap-2">
          <UserAvatar fullname={user.fullname} image={user.avatar} />
          <div>
            <Small className={"capitalize"}>{user.fullname}</Small>
            <Muted className={"text-xs capitalize"}>
              {user &&
                (user.role === "employee"
                  ? (userRoles.find((r) => r.value === user.role)?.label ??
                    user.role)
                  : user.role)}
            </Muted>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={"bottom"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                <UserRound className="text-primary" size={15} />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-xs">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
