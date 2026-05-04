import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { FloatingChat } from "@/components/site/floating-chat";
import { SiteHeader } from "@/components/site/site-header";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ELimuCore",
    template: "%s | ELimuCore"
  },
  description:
    "ELimuCore helps teachers and parents access trusted CBE and KCSE learning materials, lesson plans, exams, and revision support in one place.",
  applicationName: "ELimuCore",
  keywords: [
    "KCSE",
    "CBE",
    "teachers",
    "parents",
    "learning materials",
    "past papers",
    "lesson plans",
    "revision resources",
    "exams"
  ]
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body suppressHydrationWarning>
        <SiteHeader />
        {children}
        <FloatingChat
          supportEmail={process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
          supportWhatsapp={process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}
        />
      </body>
    </html>
  );
}
