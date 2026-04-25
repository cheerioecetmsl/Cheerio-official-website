"use client";

import { Sidebar } from "@/components/Sidebar";
import { BackgroundScanner } from "@/components/BackgroundScanner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-parchment dark:bg-dark-bg">
      <Sidebar />
      <BackgroundScanner />
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
