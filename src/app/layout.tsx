import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BannerCraft - Minecraft Banner Creator",
  description: "Create and customize Minecraft banners with a real-time preview and API generator. Supports layers, colors, and custom dimensions.",
  keywords: ["Minecraft", "Banner", "Creator", "Generator", "API", "Design Tool"],
  authors: [{ name: "AiverAiva" }],
  openGraph: {
    title: "BannerCraft",
    description: "Minecraft Banner Creator with API generator",
    url: "https://banner.weikuwu.me",
    siteName: "BannerCraft",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script 
          defer 
          data-domain="banner.weikuwu.me" 
          src="https://plausible.weikuwu.me/js/script.file-downloads.outbound-links.pageview-props.tagged-events.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300 min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1 mt-14">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
