"use client";

import { useState, useEffect } from "react";
import { 
  Image, 
  Video, 
  Search, 
  Users, 
  Settings,
  Menu,
  X,
  UploadCloud,
  ChevronRight,
  LogOut,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

const navItems = [
  { name: "Image Archive", icon: Image, path: "/dashboard/archive/images" },
  { name: "Video Archive", icon: Video, path: "/dashboard/archive/videos" },
  { name: "My Moments", icon: Search, path: "/dashboard/my-moments", id: "scanner-nav" },
  { 
    name: "Upload Media", 
    icon: UploadCloud, 
    path: "/dashboard/upload/image",
    subItems: [
      { name: "Upload Image", path: "/dashboard/upload/image" },
      { name: "Upload Video", path: "/dashboard/upload/video" },
    ]
  },
  { 
    name: "Community", 
    icon: Users, 
    path: "/dashboard/community/participants",
    id: "community-nav",
    subItems: [
      { name: "Organizers", path: "/dashboard/community/organizers" },
      { name: "Participants", path: "/dashboard/community/participants" },
      { name: "Seniors", path: "/dashboard/community/seniors" },
    ]
  },
];

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* Mobile Floating Menu Button (Top Left) */}
      <div className="fixed top-5 left-6 z-[60] md:hidden">
        <button 
          onClick={() => setIsExpanded(true)}
          className={`p-3 bg-gold text-ink rounded-full shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${
            isExpanded ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100"
          }`}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Blur Overlay */}
      <div 
        className={`fixed inset-0 bg-black/95 backdrop-blur-2xl transition-opacity duration-500 z-[55] ${
          isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsExpanded(false)}
      />

      {/* Sidebar / Top-Dropdown */}
      <aside 
        className={`fixed left-0 bg-dark-bg border-gold/10 z-[60] transition-all duration-700 ease-in-out shadow-[0_32px_128px_rgba(0,0,0,1)]
          /* Desktop: Sidebar behavior - Width 64 */
          md:top-0 md:h-screen md:w-20 md:border-r md:translate-y-0
          /* Mobile: Top Dropdown with Scroll support */
          top-0 w-full h-auto max-h-[95vh] overflow-y-auto custom-scrollbar
          ${isExpanded 
            ? "translate-y-0 opacity-100 md:w-64" 
            : "-translate-y-full opacity-0 md:opacity-100 md:translate-x-0"
          }
        `}
      >
        {/* Close Button */}
        <button 
          onClick={() => setIsExpanded(false)}
          className={`absolute top-6 right-2 p-2 text-gold hover:bg-gold/10 rounded-full transition-all z-[70] ${
            isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
          }`}
        >
          <X size={32} />
        </button>

        {/* Header Branding */}
        <div className={`h-24 flex items-center transition-all duration-500 ${isExpanded ? "px-8" : "justify-center"}`}>
          {isExpanded ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gold/60 uppercase tracking-widest">Cheerio</span>
              <span className="text-2xl font-bold serif text-gold tracking-[0.2em]">2026</span>
            </div>
          ) : (
             <button onClick={() => setIsExpanded(true)} className="p-4 text-gold hover:bg-gold/10 rounded-2xl transition-all">
                <Menu size={28} />
             </button>
          )}
        </div>

        {/* Nav Items */}
        <nav className={`mt-6 md:mt-8 flex flex-col h-auto md:h-[calc(100vh-200px)] ${isExpanded ? "items-stretch px-6" : "items-center"}`}>
          <div className={`space-y-4 md:space-y-6 ${isExpanded ? "w-full" : ""}`}>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <div key={item.name} id={item.id} className={`flex flex-col relative ${isExpanded ? "w-full" : "items-center"}`}>
                  <Link 
                    href={item.path}
                    onClick={() => !item.subItems && setIsExpanded(false)}
                    className={`flex items-center rounded-2xl transition-all duration-300 ${
                      isExpanded ? "w-full p-5 gap-6" : "w-12 h-12 justify-center"
                    } ${
                      isActive 
                        ? "bg-gold text-ink shadow-[0_0_40px_rgba(212,175,55,0.4)]" 
                        : "text-dark-text/60 hover:bg-gold/5 hover:text-gold"
                    }`}
                  >
                    <Icon size={isExpanded ? 28 : 22} className="flex-shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="font-bold tracking-widest uppercase text-sm">
                          {item.name}
                        </span>
                        {item.subItems && (
                          <ChevronRight size={18} className={`ml-auto transition-transform ${isActive ? "rotate-90" : ""}`} />
                        )}
                      </>
                    )}
                  </Link>

                  {/* Sub-items */}
                  {item.subItems && isExpanded && isActive && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 w-full pl-16">
                      {item.subItems.map(sub => (
                        <Link 
                          key={sub.name}
                          href={sub.path}
                          onClick={() => setIsExpanded(false)}
                          className="block py-2 text-xs font-bold uppercase tracking-[0.2em] text-dark-text/40 hover:text-gold transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile-Only Settings & Logout */}
            <div className="md:hidden pt-8 pb-12">
              <div className="h-px w-full bg-gold/10 mb-8" />
              <Link 
                href="/dashboard/settings"
                onClick={() => setIsExpanded(false)}
                className="flex items-center w-full p-5 gap-6 rounded-2xl text-dark-text/60 hover:bg-gold/5 hover:text-gold transition-all duration-300 mb-4"
              >
                <Settings size={28} className="flex-shrink-0" />
                <span className="font-bold tracking-widest uppercase text-sm">
                  Settings
                </span>
              </Link>
              <button 
                onClick={() => auth.signOut()}
                className="flex items-center w-full p-5 gap-6 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all duration-300"
              >
                <LogOut size={28} className="flex-shrink-0" />
                <span className="font-bold tracking-widest uppercase text-sm">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* Desktop-Only Bottom Section */}
        <div className={`hidden md:flex flex-col absolute bottom-8 left-0 w-full transition-all duration-500 ${isExpanded ? "px-6" : "items-center"}`}>
          <Link 
            href="/dashboard/settings"
            className={`flex items-center rounded-2xl text-dark-text/60 hover:bg-gold/5 hover:text-gold transition-all duration-300 mb-4 ${
              isExpanded ? "w-full p-5 gap-6" : "w-12 h-12 justify-center"
            }`}
          >
            <Settings size={isExpanded ? 28 : 22} className="flex-shrink-0" />
            {isExpanded && (
              <span className="font-bold tracking-widest uppercase text-sm">
                Settings
              </span>
            )}
          </Link>
          <button 
            onClick={() => auth.signOut()}
            className={`flex items-center rounded-2xl text-red-500 hover:bg-red-500/10 transition-all duration-300 ${
              isExpanded ? "w-full p-5 gap-6" : "w-12 h-12 justify-center"
            }`}
          >
            <LogOut size={isExpanded ? 28 : 22} className="flex-shrink-0" />
            {isExpanded && (
              <span className="font-bold tracking-widest uppercase text-sm">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

// Unified Return Button - Precision Positioned to clear Desktop Sidebar
export const ReturnToDashboard = () => (
  <Link 
    href="/dashboard"
    className="fixed top-19 left-8 md:top-8 md:left-28 z-40 flex items-center gap-2 text-gold font-bold uppercase tracking-widest text-[10px] hover:-translate-x-2 transition-transform"
  >
    <ArrowLeft size={16} /> Back to Dashboard
  </Link>
);
