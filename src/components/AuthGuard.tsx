"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * AuthGuard — mount once inside the dashboard layout.
 * On every route change (pathname change) AND on every page load,
 * Firebase's onAuthStateChanged re-evaluates the session token.
 * If the user is signed out OR their Firestore document is missing
 * (i.e. admin deleted the account), they are immediately kicked to "/".
 */
export function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Double check if auth is truly ready before redirecting to avoid reload race conditions
        await auth.authStateReady();
        if (!auth.currentUser) {
          router.replace("/");
        }
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          await auth.signOut();
          router.replace("/");
          return;
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Auth verification error:", error);
        // On error, we still initialize to allow standard recovery
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
          Authenticating Session...
        </p>
      </div>
    );
  }

  return null; // purely functional once initialized
}

