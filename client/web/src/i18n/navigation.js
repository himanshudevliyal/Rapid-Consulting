import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

/**
 * Locale-aware wrappers around Next.js' navigation APIs.
 *
 * Use these for new links written without a language (href="/contact"): they
 * add the current language. Hrefs that already include it (/en/contact, as
 * built by lib/site.js and lib/page-routes.js) work with plain <a>/next/link.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
