"use client";

import { auth } from "@/lib/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const isCheckingRedirect = useRef(false);

  // 1. Monitor Auth State directly (Robust fallback for PWA redirect issues)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isProcessing) {
        console.log("Auth state detected user:", user.email);
        router.push("/onboarding");
      }
    });
    return () => unsubscribe();
  }, [router, isProcessing]);

  // 2. Handle results from Redirect Sign-In
  useEffect(() => {
    const handleRedirect = async () => {
      if (isCheckingRedirect.current) return;
      isCheckingRedirect.current = true;

      try {
        setIsProcessing(true);
        console.log("Checking for redirect result...");
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          console.log("Redirect sign-in successful:", result.user.email);
          router.push("/onboarding");
        }
      } catch (err: any) {
        console.error("Redirect Auth Error:", err);
        const message = err?.message || "";
        
        // Gracefully handle "missing initial state" which is common in PWAs
        if (message.includes("missing initial state")) {
          console.warn("Redirect state lost (missing initial state).");
          // If we have a user from onAuthStateChanged, this error doesn't matter.
          // If not, we just stay on the login page so they can try again.
        } else {
          setError(err instanceof Error ? err.message : "Sign-in via redirect failed.");
        }
      } finally {
        setIsProcessing(false);
      }
    };

    handleRedirect();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsProcessing(true);
      setError("");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      console.log("Attempting Google Sign-In with Popup...");
      try {
        await signInWithPopup(auth, provider);
        router.push("/onboarding");
      } catch (popupError: any) {
        console.warn("Popup sign-in failed or blocked:", popupError);
        
        // Only fallback to redirect if popup is blocked or explicitly unavailable
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
          console.log("Falling back to Redirect...");
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (err: unknown) {
      console.error("Google Sign-In Error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      
      // Special handling for the "missing initial state" error if it somehow bubbles up
      if (message.includes("missing initial state")) {
        setError("Sign-in state was lost. Please try again. If you are using a private window or 'Add to Home Screen', try using the standard browser.");
      } else {
        setError(message);
      }
      setIsProcessing(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/onboarding");
    } catch (err: unknown) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-parchment">
      <div className="glass-card p-8 md:p-12 rounded-3xl w-full max-w-md text-center border-gold/30">
        <h1 className="text-4xl font-bold mb-2 text-brown-primary serif">Welcome</h1>
        <p className="text-brown-secondary/60 mb-8 italic serif">Begin your Cheerio journey</p>

        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        <button 
          onClick={handleGoogleSignIn}
          disabled={isProcessing}
          className="w-full mb-4 flex items-center justify-center gap-3 bg-white text-black border border-brown-primary/10 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Image 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              width={20}
              height={20}
              className="w-5 h-5" 
            />
          )}
          {isProcessing ? "Authenticating..." : "Continue with Google"}
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px flex-1 bg-brown-primary/10" />
          <span className="text-brown-secondary/40 text-sm">OR</span>
          <div className="h-px flex-1 bg-brown-primary/10" />
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-brown-secondary/70 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/50 border border-brown-primary/10 rounded-lg p-3 outline-none focus:border-gold-primary transition-all text-black"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-secondary/70 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/50 border border-brown-primary/10 rounded-lg p-3 outline-none focus:border-gold-primary transition-all text-black"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="gold-button w-full py-3 rounded-lg font-bold tracking-widest uppercase mt-4"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-brown-secondary/50 text-xs serif italic">
          By continuing, you agree to join the 2026 Farewell legacy.
        </p>
      </div>
    </main>
  );
}
