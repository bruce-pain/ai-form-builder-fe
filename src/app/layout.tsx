import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/components/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/og";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
});

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Formbrew: Describe it. The form brews itself.",
    template: "%s · Formbrew",
  },
  description:
    "Describe a form in plain English and let AI write the questions. Refine with chat, then publish, share, and collect responses from a single link.",
  openGraph: {
    type: "website",
    siteName: "Formbrew",
    locale: "en_US",
    title: "Formbrew: Describe it. The form brews itself.",
    description:
      "Describe a form in plain English and let AI write the questions. Refine with chat, then publish, share, and collect responses from a single link.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formbrew: Describe it. The form brews itself.",
    description:
      "Describe a form in plain English and let AI write the questions. Refine with chat, then publish, share, and collect responses from a single link.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
