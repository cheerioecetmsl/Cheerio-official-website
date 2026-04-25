import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cheerio 2026 | Cheerio",
  description: "A journey of a thousand memories begins with a single frame.",
  icons: {
    icon: "/assets/cheerio logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${ebGaramond.variable} antialiased film-grain min-h-screen bg-dark-bg text-dark-text`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
