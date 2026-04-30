"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import IntroAnimation from "@/components/ui/scroll-morph-hero";

export default function Home() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            router.push("/dashboard");
            return; // Stay in checking state while redirecting
          } else {
            router.push("/onboarding");
            return;
          }
        } catch (err) {
          console.error("Session check error:", err);
          setCheckingSession(false);
        }
      } else {
        setCheckingSession(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // While checking if the user is already logged in, show a minimal cinematic loader or nothing
  if (checkingSession) {
    return (
      <div className="fixed inset-0 bg-parchment dark:bg-dark-bg flex items-center justify-center z-[200]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-gold font-bold tracking-widest uppercase text-xs animate-pulse">Checking Archive...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative bg-[#E3D8C3]">
      
      {/* 
          Container for Natural Scroll. 
          The page is long (400vh) to provide scroll depth.
          The IntroAnimation is sticky so it stays in view while you scroll.
      */}
      <div className="h-[400vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <IntroAnimation />
        </div>
      </div>

      {/* 
          Final Entry Button (Appears at the very bottom of the 400vh scroll) 
      */}
      <div className="absolute bottom-20 left-0 w-full flex justify-center px-6">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
          className="gold-button px-12 py-5 rounded-full text-xl font-bold tracking-[0.3em] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          Sign the Register
        </button>
      </div>

    </main>
  );
}
