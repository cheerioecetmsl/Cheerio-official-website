"use client";

import { useState, useEffect } from "react";
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Search, 
  Users, 
  Settings,
  Menu,
  X,
  UploadCloud,
  ChevronRight,
  LogOut,
  ArrowLeft,
  Camera,
  Link2,
  School
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { LogoutModal } from "@/components/LogoutModal";

const navItems = [
  { name: "Image Archive", icon: ImageIcon, path: "/dashboard/archive/images" },
  { name: "Video Archive", icon: VideoIcon, path: "/dashboard/archive/videos" },
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
  { name: "Our Legacy", icon: School, path: "/dashboard/legacy" },
];


export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Non-cascading mount to satisfy strict linting and ensure hydration stability
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateHeight = () => setSidebarHeight(window.innerHeight);
    updateHeight();
    window.addEventListener('resize', updateHeight);

    // Listen for external requests to open the sidebar (e.g. from the tutorial)
    const handleOpenRequest = () => setIsExpanded(true);
    const handleCloseRequest = () => setIsExpanded(false);
    window.addEventListener('open-sidebar', handleOpenRequest);
    window.addEventListener('close-sidebar', handleCloseRequest);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('open-sidebar', handleOpenRequest);
      window.removeEventListener('close-sidebar', handleCloseRequest);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* Mobile Floating Menu Button (Top Left) */}
      <div className="fixed top-5 left-6 z-[60] md:hidden">
        <button 
          onClick={() => setIsExpanded(true)}
          className={`p-3 text-brown-primary rounded-full shadow-lg transition-all duration-500 hover:scale-110 active:scale-95 ${
            isExpanded ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100"
          }`}
          style={{ background: 'rgba(245,230,204,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Blur Overlay — soft parchment tint, not black */}
      <div 
        className={`fixed inset-0 transition-opacity duration-500 z-[55] ${
          isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backdropFilter: isExpanded ? 'blur(20px)' : 'none', background: 'rgba(245,230,204,0.25)' }}
        onClick={() => setIsExpanded(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-[60] transition-all duration-700 ease-in-out
          md:border-r md:translate-y-0 md:flex md:flex-col
          w-full h-auto max-h-[95vh] overflow-y-auto md:overflow-hidden
          ${isExpanded 
            ? "translate-y-0 opacity-100 md:w-64" 
            : "-translate-y-full opacity-0 md:opacity-100 md:translate-x-0 md:w-20"
          }
        `}
        style={{
          height: window.innerWidth >= 768 ? `${sidebarHeight}px` : undefined,
          /* Collapsed: near-invisible glass that absorbs page color */
          /* Expanded: solid parchment panel */
          background: isExpanded
            ? 'rgba(245, 230, 204, 0.92)'
            : 'rgba(245, 230, 204, 0.08)',
          backdropFilter: isExpanded ? 'blur(24px)' : 'blur(8px)',
          WebkitBackdropFilter: isExpanded ? 'blur(24px)' : 'blur(8px)',
          borderColor: 'rgba(212, 175, 55, 0.2)',
          boxShadow: isExpanded
            ? '4px 0 40px rgba(107, 68, 35, 0.15)'
            : '2px 0 16px rgba(107, 68, 35, 0.06)',
        }}
      >
        {/* Close Button */}
        <button 
          onClick={() => setIsExpanded(false)}
          className={`absolute top-6 right-2 p-2 rounded-full transition-all z-[70] ${
            isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
          }`}
          style={{ color: 'var(--color-brown-primary)', background: 'rgba(212,175,55,0.15)' }}
        >
          <X size={28} />
        </button>

        {/* Header Branding */}
        <div className={`h-24 flex items-center transition-all duration-500 ${isExpanded ? "px-8" : "justify-center"}`}>
          {isExpanded ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-brown-secondary)' }}>Cheerio</span>
              <span className="text-2xl font-bold serif tracking-[0.2em]" style={{ color: 'var(--color-brown-primary)' }}>2026</span>
            </div>
          ) : (
             <button
               onClick={() => setIsExpanded(true)}
               className="p-4 rounded-2xl transition-all hover:bg-gold-soft/20"
               style={{ color: 'var(--color-brown-primary)' }}
             >
               <Menu size={26} />
             </button>
          )}
        </div>

        {/* Nav Items */}
        <nav className={`mt-4 md:mt-6 flex flex-col h-auto ${isExpanded ? "items-stretch px-6" : "items-center"}`}>
          <div className={`space-y-3 md:space-y-4 ${isExpanded ? "w-full" : ""}`}>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <div key={item.name} id={item.id} className={`flex flex-col relative ${isExpanded ? "w-full" : "items-center"}`}>
                  <Link 
                    href={item.path}
                    onClick={() => !item.subItems && setIsExpanded(false)}
                    className={`flex items-center rounded-2xl transition-all duration-300 ${
                      isExpanded ? "w-full p-4 gap-6" : "w-12 h-12 justify-center"
                    }`}
                    style={isActive ? {
                      background: 'var(--color-gold-primary)',
                      color: 'var(--color-theme-text-primary)',
                      boxShadow: '0 0 18px rgba(212,175,55,0.35)',
                    } : {
                      color: 'var(--color-brown-primary)',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.18)'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <Icon size={isExpanded ? 26 : 22} className="flex-shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="font-bold tracking-widest uppercase text-xs">
                          {item.name}
                        </span>
                        {item.subItems && (
                          <ChevronRight size={16} className={`ml-auto transition-transform ${isActive ? "rotate-90" : ""}`} />
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
                          className="block py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                          style={{ color: 'var(--color-brown-secondary)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold-primary)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-brown-secondary)')}
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
              <div className="h-px w-full mb-8" style={{ background: 'rgba(107,68,35,0.2)' }} />
              <Link 
                href="/dashboard/settings"
                onClick={() => setIsExpanded(false)}
                className="flex items-center w-full p-5 gap-6 rounded-2xl transition-all duration-300 mb-4"
                style={{ color: 'var(--color-brown-primary)' }}
              >
                <Settings size={28} className="flex-shrink-0" />
                <span className="font-bold tracking-widest uppercase text-xs">Settings</span>
              </Link>
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center w-full p-5 gap-6 rounded-2xl text-red-600 hover:bg-red-500/10 transition-all duration-300"
              >
                <LogOut size={28} className="flex-shrink-0" />
                <span className="font-bold tracking-widest uppercase text-xs">Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Spacer */}
        <div className="hidden md:block flex-grow" />

        {/* Desktop-Only Bottom Section */}
        <div className={`hidden md:flex flex-col pb-8 transition-all duration-500 ${isExpanded ? "px-6" : "items-center"}`}>
          {/* Thin divider */}
          {isExpanded && <div className="h-px w-full mb-4" style={{ background: 'rgba(107,68,35,0.15)' }} />}
          <Link 
            href="/dashboard/settings"
            className={`flex items-center rounded-2xl transition-all duration-300 mb-2 ${
              isExpanded ? "w-full p-4 gap-6" : "w-12 h-12 justify-center"
            }`}
            style={{ color: 'var(--color-brown-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Settings size={isExpanded ? 26 : 22} className="flex-shrink-0" />
            {isExpanded && <span className="font-bold tracking-widest uppercase text-xs">Settings</span>}
          </Link>

          <button 
            onClick={() => setShowLogoutModal(true)}
            className={`flex items-center gap-4 w-full rounded-2xl text-red-600/80 hover:text-red-600 hover:bg-red-500/10 transition-all duration-500 ${
              isExpanded ? "p-4 justify-start" : "w-12 h-12 justify-center"
            }`}
          >
            <LogOut size={20} />
            {isExpanded && <span className="font-bold uppercase tracking-widest text-[9px]">Logout Archive</span>}
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};


// Unified Return Button - Precision Positioned to clear Desktop Sidebar
export const ReturnToDashboard = () => (
  <Link 
    href="/dashboard"
    className="fixed top-19 left-8 md:top-8 md:left-28 z-40 flex items-center gap-2 text-brown-primary font-bold uppercase tracking-widest text-[10px] hover:-translate-x-2 transition-transform"
  >
    <ArrowLeft size={16} /> Back to Dashboard
  </Link>
);
