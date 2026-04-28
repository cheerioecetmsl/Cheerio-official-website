"use client";

import { Sidebar } from "@/components/Sidebar";
import { BackgroundScanner } from "@/components/BackgroundScanner";
import { CinematicDecor } from "@/components/CinematicDecor";
import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="theme-cinematic min-h-screen">
      <AuthGuard />
      <Sidebar />
      <BackgroundScanner />
      {/* Bollywood cinematic decor — scattered SVG icons, pointer-events none */}
      <CinematicDecor />
      {/* 
          Mobile Optimization: 
          - pl-0 on mobile (sidebar is hidden or icons only)
          - pl-20 on desktop (for the collapsed sidebar width)
      */}
      <div className="pl-0 md:pl-20 min-h-screen transition-all duration-500">
        {children}
      </div>
    </div>
  );
}
