import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/components/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://formbrew.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Formbrew",
  description: "Describe it. The form brews itself.",
  openGraph: {
    type: "website",
    siteName: "Formbrew",
    locale: "en_US",
    title: "Formbrew",
    description: "Describe it. The form brews itself.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formbrew",
    description: "Describe it. The form brews itself.",
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
