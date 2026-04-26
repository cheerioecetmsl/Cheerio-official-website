import type { Metadata, Viewport } from "next";
import { Inter, EB_Garamond, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-circuit",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Cheerio 2026 | The Archival Legacy",
  description: "A journey of a thousand memories begins with a single frame. Preserve the legacy of the Batch of 2026.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cheerio 2026",
  },
  icons: {
    icon: "/assets/pwa-logo.png",
    apple: "/assets/pwa-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#D4AF37",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${ebGaramond.variable} ${shareTechMono.variable} antialiased film-grain min-h-screen bg-dark-bg text-dark-text`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
