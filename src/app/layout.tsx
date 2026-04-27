import type { Metadata, Viewport } from "next";
import { Inter, EB_Garamond, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import PWARegistration from "@/components/PWARegistration";

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
  applicationName: "Cheerio 2026",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/assets/cheerio logo copy.png",
    apple: "/assets/cheerio logo copy.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${ebGaramond.variable} ${shareTechMono.variable} antialiased film-grain min-h-screen bg-dark-bg text-dark-text`}>
        <PWARegistration />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
