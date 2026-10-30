"use client";
import { ROLES, homeRouteForRole, sidebarData } from "@/data/routes";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "./auth-provider";

export default function ProtectedRouteProvider({ children }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useContext(AuthContext);

  const protectedRoutes = useMemo(() => {
    const mainRoutes = sidebarData.map((data) => ({
      url: data.url,
      roles: data.roles,
    }));

    const subRoutes = sidebarData
      .flatMap((data) => data.items || [])
      .filter(Boolean) // Remove any undefined/null items
      .map((data) => ({
        url: data.url,
        roles: data.roles,
      }));

    return [...mainRoutes, ...subRoutes];
  }, []);

  useEffect(() => {
    if (!!isUserLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    const currRoute = pathname.replace(params.id, ":id");
    const protectedRoute = protectedRoutes.find((route) => {
      const routePattern = route.url.split("?")[0];
      return routePattern === currRoute;
    });
    if (!protectedRoute) {
      // Editors may only open the pages listed for their role.
      if (user.role === ROLES.EDITOR && pathname !== "/unauthorized") {
        router.replace("/unauthorized");
      }
      return;
    }

    const hasPermission = protectedRoute.roles.includes(user.role);

    if (!hasPermission) {
      // An editor who lands on the dashboard goes to their own home page.
      router.replace(
        user.role === ROLES.EDITOR && currRoute === "/dashboard"
          ? homeRouteForRole(user.role)
          : "/unauthorized",
      );
    }
  }, [user, params.id, pathname, router, isUserLoading, protectedRoutes]);

  return children;
}
