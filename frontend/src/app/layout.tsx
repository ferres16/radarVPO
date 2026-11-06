import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import { PublicAdFrame } from "@/components/ads";
import { AdsenseSiteVerification } from "@/components/ads/adsense-site-verification";
import { ConsentProvider } from "@/components/consent/consent-provider";
import { ConsentedScripts } from "@/components/consent/consented-scripts";
import { CookieBanner } from "@/components/consent/cookie-banner";
import { VisitTracker } from "@/components/conversion/visit-tracker";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { ProAccessProvider } from "@/components/pro-access-provider";
import { SiteFooter } from "@/components/site-footer";
import { TopNav } from "@/components/top-nav";
import { DEFAULT_LOCALE, LOCALE_COOKIE, htmlLang, parseLocale } from "@/lib/i18n/locales";
import { siteConfig } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo-radar-vpo.png",
  },
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLocale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value) || DEFAULT_LOCALE;

  return (
    <html lang={htmlLang(initialLocale)} className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <head>
        <AdsenseSiteVerification />
      </head>
      <body className="min-h-full flex flex-col pt-[4.25rem] md:pt-20">
        <ConsentProvider>
          <LocaleProvider initialLocale={initialLocale}>
            <ProAccessProvider>
              <VisitTracker />
              <TopNav />
              <div className="flex-1">
                <PublicAdFrame>{children}</PublicAdFrame>
              </div>
              <SiteFooter />
              <CookieBanner />
            </ProAccessProvider>
          </LocaleProvider>
          <ConsentedScripts vercelAnalytics={process.env.VERCEL === '1'} />
        </ConsentProvider>
      </body>
    </html>
  );
}
