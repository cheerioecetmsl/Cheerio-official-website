"use client";

import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
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
    } catch (err: any) {
      if (err.code !== "auth/cancelled-popup-request") {
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
    <nav className={`fixed top-0 left-0 w-full z-[110] px-6 py-4 flex justify-between items-center transition-all duration-700 ${
      isScrolled && !isHome ? "bg-black/40 backdrop-blur-xl border-b border-gold/10" : "bg-transparent"
    }`}>
      <Link href="/" className="flex items-center gap-4 group">
        {/* Navbar Logo Landing Zone */}
        {isHome ? (
          <div className="w-10 md:w-16 h-8 md:h-12 flex-shrink-0" /> // Reserved space for gliding logo
        ) : (
          <img 
            src="/assets/cheerio logo.png" 
            alt="Cheerio Logo" 
            className="h-8 md:h-12 w-auto"
          />
        )}
        <span className="text-xl md:text-2xl font-bold serif text-gold tracking-widest pl-2 transition-all">
          CHEERIO <span className="text-gold-soft">2026</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {!loading && (
          user ? (
            <Link 
              href="/dashboard"
              className="gold-button px-6 py-2 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider"
            >
              Dashboard
            </Link>
          ) : (
            <button 
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="px-6 py-2 border border-gold/40 text-gold hover:bg-gold hover:text-ink rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {isSigningIn ? "Signing In..." : "Sign In"}
            </button>
          )
        )}
      </div>
    </nav>
  );
};
