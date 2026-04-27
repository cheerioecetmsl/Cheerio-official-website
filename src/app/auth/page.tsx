"use client";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
          className="w-full mb-4 flex items-center justify-center gap-3 bg-white text-black border border-brown-primary/10 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
        >
          <Image 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            width={20}
            height={20}
            className="w-5 h-5" 
          />
          Continue with Google
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
