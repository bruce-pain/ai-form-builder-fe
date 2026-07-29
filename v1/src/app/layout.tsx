import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/next";
import { Bricolage_Grotesque, Outfit } from "next/font/google";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const outfit = Outfit({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "AI Form Builder",
  description: "AI-powered form builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolageGrotesque.variable} ${outfit.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider>{children}</SessionProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
