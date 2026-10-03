import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Language routing: "/" and paths without a language are redirected to
// /{locale}/... (saved choice, then browser language, then English).
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and files (assets, downloads, sitemap.xml…).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
