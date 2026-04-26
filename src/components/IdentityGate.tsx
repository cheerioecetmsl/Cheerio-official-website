"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, Settings, ShieldAlert, ArrowRight, Camera, Loader2 } from "lucide-react";
import { verifyIdentity } from "@/lib/pulse";
import { useRouter } from "next/navigation";

export function IdentityGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "invalid" | "valid">("checking");
  const [errorType, setErrorType] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const result = await verifyIdentity();
      if (result.success) {
        setStatus("valid");
      } else {
        setStatus("invalid");
        setErrorType(result.error || "UNKNOWN");
      }
    };
    check();
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-gold/10 rounded-full" />
          <div className="absolute inset-0 w-24 h-24 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-gold/40">
            <ShieldAlert size={32} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-gold font-bold uppercase tracking-[0.4em] text-[10px]">Neural Identity Check</p>
          <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest animate-pulse">Verifying Biometric Signature...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="fixed inset-0 z-[200] bg-dark-bg flex items-center justify-center p-6 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent)] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-xl w-full glass-card p-12 rounded-[3rem] border-rose-500/20 bg-zinc-900/90 text-center space-y-10 relative overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.8)]"
        >
          {/* Error Icon */}
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 border border-rose-500/20">
              <Camera size={40} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white border-4 border-zinc-900 shadow-xl">
              <ShieldAlert size={14} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white serif">Identity Verification Halted.</h2>
            <div className="p-6 bg-rose-500/5 rounded-2xl border border-rose-500/10">
              <p className="text-rose-400/80 text-sm italic serif leading-relaxed">
                &quot;The neural engine could not extract a definitive biometric signature from your profile. 
                Our archival protocol requires a clear, human-like reference photo to synchronize your moments.&quot;
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => router.push("/dashboard/settings")}
              className="w-full max-w-sm flex items-center justify-center gap-3 bg-gold text-ink px-6 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-xl active:scale-95"
            >
              <Settings size={18} /> Settings
            </button>
          </div>

          <button 
            onClick={() => router.push("/dashboard")}
            className="text-[9px] font-bold text-white/30 hover:text-gold uppercase tracking-[0.3em] transition-all"
          >
            Return to Command Center
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
