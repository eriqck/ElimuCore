import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-scheme-bot"
});

export default function SchemeBotLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className={`${inter.variable} scheme-bot-shell`}>{children}</div>;
}
