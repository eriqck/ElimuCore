import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Manrope } from "next/font/google";
import { MarketingPageTracker } from "@/components/marketing/marketing-page-tracker";
import { MarketingScripts } from "@/components/marketing/marketing-scripts";
import { FloatingChat } from "@/components/site/floating-chat";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  siteDescription,
  siteKeywords,
  siteName,
  siteOgImageUrl,
  siteUrl
} from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  verification: {
    google: "migO_x8dcUjQihsjF67GSo1OfQJhCi1dPu3luAKikIo"
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: siteKeywords,
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName,
    url: siteUrl,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: siteOgImageUrl,
        width: 1200,
        height: 630,
        alt: `${siteName} social preview`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [siteOgImageUrl]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body suppressHydrationWarning>
        <MarketingScripts />
        <Suspense fallback={null}>
          <MarketingPageTracker />
        </Suspense>
        <SiteHeader />
        {children}
        <SiteFooter />
        <FloatingChat
          supportEmail={process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
          supportWhatsapp={process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}
        />
      </body>
    </html>
  );
}
