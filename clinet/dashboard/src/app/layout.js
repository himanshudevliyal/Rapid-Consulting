import "./globals.css";
import Layout from "@/components/layout";
import { ThemeProvider } from "@/providers/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Google_Sans, Merriweather, Google_Sans_Code } from "next/font/google";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";

const googleSans = Google_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const merriweather = Merriweather({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const googleSansCode = Google_Sans_Code({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Dashboard",
  description: "dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${googleSans.variable} ${merriweather.variable} ${googleSansCode.variable} bg-background overflow-hidden overscroll-none antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <Layout>
              <ToastProvider>
                <AnchoredToastProvider>{children}</AnchoredToastProvider>
              </ToastProvider>
            </Layout>
          </NuqsAdapter>
        </ThemeProvider>
        {/* <Toaster richColors closeButton /> */}
      </body>
    </html>
  );
}
