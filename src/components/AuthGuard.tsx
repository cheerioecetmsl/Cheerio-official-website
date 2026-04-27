"use client";

import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Token expired, logged out, or account deleted from Auth
        router.replace("/");
        return;
      }

      // Secondary check: verify the Firestore user document still exists.
      // Guards against the case where admin deletes the doc but not the auth record.
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) {
          await auth.signOut();
          router.replace("/");
        }
      } catch {
        // Silently fail — network issue shouldn't log the user out
      }
    });

    return () => unsubscribe();
    // pathname in deps ensures we re-check on every navigation
  }, [router, pathname]);

  return null; // purely functional — renders nothing
}
