"use client";

import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image"; // Stabilizes Next.js 16 module evaluation on Cloudflare
import { User as FirebaseUser } from "firebase/auth";

// @ts-ignore - Explicitly keep next/image in the bundle
const _unused = Image;

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Hide Navbar completely on dashboard routes to prevent clashing with Sidebar & mobile layout
  const isDashboard = pathname?.startsWith("/dashboard");

  const handleSignIn = useCallback(async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    
    try {
      const provider = new GoogleAuthProvider();
      // By not forcing 'select_account', Google will often auto-login if only one account exists
      const result = await signInWithPopup(auth, provider);
      
      setLoading(true); // Show loading while checking DB
      const docRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err as { code?: string }).code !== "auth/cancelled-popup-request") {
        console.error("Auth Error:", err);
      }
      setLoading(false);
    } finally {
      setIsSigningIn(false);
    }
  }, [isSigningIn, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    const handleOpenAuth = () => handleSignIn();
    window.addEventListener('open-auth', handleOpenAuth);

    return () => {
      unsubscribe();
      window.removeEventListener('open-auth', handleOpenAuth);
    };
  }, [handleSignIn]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isDashboard) return null;

  const isHome = pathname === "/";

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-[110] px-6 py-4 flex justify-between items-center transition-all duration-700 ${
        isHome 
          ? (isScrolled ? "bg-parchment-base/40 backdrop-blur-xl border-b border-gold-soft/10" : "bg-transparent")
          : "theme-cinematic-navbar shadow-md"
      }`}
      style={!isHome ? { backgroundColor: 'var(--color-brown-primary)', borderBottom: '1px solid var(--color-gold-soft)' } : {}}
    >
      <Link href="/" prefetch={false} className="flex items-center gap-4 group">
        {/* Navbar Logo Landing Zone */}
        {isHome ? (
          <div className="w-10 md:w-16 h-8 md:h-12 flex-shrink-0" /> // Reserved space for gliding logo
        ) : (
          <img 
            src="/assets/cheerio logo.png" 
            alt="Cheerio Logo" 
            className="h-8 md:h-12 w-auto object-contain"
            style={{ 
              filter: 'sepia(1) hue-rotate(330deg) saturate(2)',
            }} 
          />
        )}
        <span 
          className="text-xl md:text-2xl font-bold serif tracking-widest pl-2 transition-all"
          style={!isHome ? { color: 'var(--color-gold-primary)' } : { color: 'var(--color-gold-primary)' }}
        >
          CHEERIO <span style={!isHome ? { color: 'var(--color-gold-soft)' } : { color: 'var(--color-gold-soft)' }}>2026</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {!loading && (
          user ? (
            <Link 
              href="/dashboard"
              prefetch={false}
              className={isHome ? "gold-button px-6 py-2 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider" : "theme-cinematic-btn-primary px-6 py-2 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider"}
            >
              Dashboard
            </Link>
          ) : (
            <button 
              onClick={handleSignIn}
              disabled={isSigningIn}
              className={isHome ? "px-6 py-2 border border-gold-soft/40 text-gold-primary hover:bg-gold-primary hover:text-black rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50" : "theme-cinematic-btn-secondary px-6 py-2 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider disabled:opacity-50"}
            >
              {isSigningIn ? "Signing In..." : "Sign In"}
            </button>
          )
        )}
      </div>
    </nav>
  );
};
