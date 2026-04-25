import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
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
    "ELimuCore helps teachers and parents access trusted CBE and KCSE learning materials with a Supabase-backed backend and Vercel-ready frontend.",
  applicationName: "ELimuCore",
  keywords: [
    "KCSE",
    "CBE",
    "teachers",
    "parents",
    "learning materials",
    "past papers",
    "lesson plans",
    "Supabase",
    "Vercel"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
