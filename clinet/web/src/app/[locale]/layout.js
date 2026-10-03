import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DM_Sans } from "next/font/google";

import {
  hasLocale,
  NextIntlClientProvider,
} from "next-intl";

import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { Toaster } from "sonner";

import "../globals.css";

import { routing } from "@/i18n/routing";
import QueryProvider from "@/providers/query-client-provider";
import { fetchServices } from "@/services/service-service";
import { SITE_URL } from "@/lib/site";
import { robots } from "@/lib/seo";

import { ChatWidget } from "@/components/contact/chat-widget";
import { AlternatesProvider } from "@/components/layout/page-alternates";
import { LanguageFallbackNotice } from "@/components/layout/language-fallback-notice";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/* DM Sans */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

/* Generate locale pages */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale });

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: t("meta.siteName"),
    description: t("meta.defaultDescription"),
    robots,
  };
}

/* Root Layout */
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  /* Validate locale */
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  /* Enable static rendering */
  setRequestLocale(locale);

  const [messages, t] = await Promise.all([
    getMessages(),
    getTranslations({ locale }),
  ]);

  /*
   * The header menu and search list services from the API.
   * If the API is down, pages still render with an empty menu.
   */
  const services = await fetchServices(locale).catch(() => []);

  return (
    <html lang={locale}>
      <body className={`${dmSans.variable} font-sans`}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
        >
          <QueryProvider>
            <AlternatesProvider>
              <a
                className="skip-link"
                href="#main"
              >
                {t("common.skipToContent")}
              </a>

              <SiteHeader services={services} />

              <Suspense fallback={null}>
                <LanguageFallbackNotice />
              </Suspense>

              {children}

              <SiteFooter locale={locale} />

              <ChatWidget />
            </AlternatesProvider>
          </QueryProvider>

          <Toaster
            richColors
            position="top-right"
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}