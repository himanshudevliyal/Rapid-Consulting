"use client";
import AuthProvider from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-client-provider";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../app-sidebar";
import { SiteHeader } from "../site-header";
import ProtectedRouteProvider from "@/providers/protected-route-provider";
import { publicRoutes } from "@/data/routes";

export default function Layout({ children }) {
  const pathname = usePathname();
  const getContent = () => {
    if (publicRoutes.includes(pathname)) {
      return children;
    }

    return (
      <AuthProvider>
        <ProtectedRouteProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <SiteHeader />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </ProtectedRouteProvider>
      </AuthProvider>
    );
  };

  return <QueryProvider>{getContent()}</QueryProvider>;
}
