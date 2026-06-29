import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { MobileStickyAd } from "@/components/ads";
import { SiteFooter } from "@/components/site-footer";
import { TopNav } from "@/components/top-nav";
import { adsConfig } from "@/lib/ads";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col pt-16 md:pt-20">
        {adsConfig.enabled && adsConfig.clientId ? (
          <Script
            id="adsense-script"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.clientId}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <TopNav />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <MobileStickyAd />
      </body>
    </html>
  );
}
