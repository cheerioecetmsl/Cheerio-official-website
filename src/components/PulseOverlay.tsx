"use client";

import { useState, useEffect } from "react";
import { Sparkles, Smartphone, ShieldCheck, Zap, X, Loader2, CheckCircle } from "lucide-react";
import { runPulseScan } from "@/lib/pulse";
import { motion, AnimatePresence } from "framer-motion";

export const PulseOverlay = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [status, setStatus] = useState<"idle" | "scanning" | "completed" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartScan = async () => {
    setStatus("scanning");
    setProgress(0);
    setCurrent(0);
    setTotal(0);
    setMatchCount(0);
    setErrorMessage("");
    
    const result = await runPulseScan((p) => {
      setProgress(p.percent);
      setCurrent(p.current);
      setTotal(p.total);
      setMatchCount(p.found);
      setStatusText(p.status);
    });
    
    if (result.success) {
      setMatchCount(result.count || 0);
      setStatus("completed");
    } else {
      setErrorMessage(result.error || "Biometric scan disrupted.");
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-parchment-base/90 backdrop-blur-2xl"
          onClick={status !== "scanning" ? onClose : undefined}
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative glass-card max-w-2xl w-full rounded-[3rem] border-gold-soft/20 overflow-hidden bg-card-tone shadow-[0_0_100px_rgba(107,68,35,0.1)]"
        >
          {status !== "scanning" && (
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-3 bg-brown-primary/5 hover:bg-brown-primary/10 rounded-full transition-colors z-10"
            >
              <X size={20} className="text-brown-primary/40" />
            </button>
          )}

          <div className="p-8 md:p-12 space-y-8 text-center">
            {/* Header Icon */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gold-soft/20 blur-3xl rounded-full" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-gold-soft/20 to-amber-500/20 rounded-[2rem] border border-gold-soft/30 flex items-center justify-center mx-auto">
                {status === "idle" && <Zap className="text-gold-primary animate-pulse" size={40} />}
                {status === "scanning" && <Loader2 className="text-gold-primary animate-spin" size={40} />}
                {status === "completed" && <CheckCircle className="text-emerald-500" size={40} />}
                {status === "error" && <X className="text-rose-500" size={40} />}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-brown-primary serif tracking-tight">
                {status === "idle" && "Global Pulse Engine."}
                {status === "scanning" && "Scanning Archives."}
                {status === "completed" && "Archival Discovery Sync."}
                {status === "error" && "Engine Interrupted."}
              </h2>
              <p className="text-brown-secondary/60 text-sm font-bold tracking-[0.2em] uppercase">
                {status === "idle" && "Biometric Identity Verification"}
                {status === "scanning" && "Neural Cross-Reference in Progress"}
                {status === "completed" && "Sync Finalized Successfully"}
                {status === "error" && "Archival Protocol Failure"}
              </p>
            </div>

            {/* Content Area */}
            <div className="min-h-[120px] flex items-center justify-center py-4">
              {status === "idle" && (
                <div className="space-y-6 max-w-md">
                  <div className="p-4 bg-brown-primary/5 rounded-2xl border border-brown-primary/10 flex items-start gap-4 text-left">
                    <Smartphone className="text-gold-primary mt-1 shrink-0" size={20} />
                    <p className="text-brown-primary/70 text-sm leading-relaxed">
                      For maximum efficiency, keep your device open. The engine will scan every newly archived image for your biometric signature.
                    </p>
                  </div>
                  <button 
                    onClick={handleStartScan}
                    className="w-full py-5 bg-gold-primary text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)] active:scale-95"
                  >
                    Initialize Scan
                  </button>
                </div>
              )}

              {status === "scanning" && (
                <div className="w-full space-y-6">
                  <div className="relative h-2 w-full bg-brown-primary/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-primary to-amber-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brown-primary/30">
                      <span className="text-brown-primary animate-pulse">{statusText}</span>
                      <span className="text-brown-primary">{Math.round(progress)}%</span>
                    </div>
                    {total > 0 && (
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-bold text-brown-primary/20 uppercase tracking-widest">
                          Found: <span className="text-brown-primary font-black">{matchCount}</span>
                        </p>
                        <p className="text-[10px] font-bold text-brown-primary/20 uppercase tracking-widest">
                          Processed: <span className="text-brown-primary/60">{current} / {total}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {status === "completed" && (
                <div className="space-y-6 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-brown-primary/5 rounded-3xl border border-brown-primary/10">
                      <p className="text-brown-secondary/40 text-[10px] font-bold uppercase tracking-widest mb-1">Found Memories</p>
                      <p className="text-4xl font-bold text-brown-primary serif">{matchCount}</p>
                    </div>
                    <div className="p-6 bg-brown-primary/5 rounded-3xl border border-brown-primary/10">
                      <p className="text-brown-secondary/40 text-[10px] font-bold uppercase tracking-widest mb-1">Sync Status</p>
                      <p className="text-xl font-bold text-emerald-600 serif mt-2 uppercase tracking-tight">Verified</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-full py-5 bg-brown-primary/10 text-brown-primary font-bold rounded-2xl hover:bg-brown-primary/20 transition-all"
                  >
                    Finalize Archival Session
                  </button>
                </div>
              )}

              {status === "error" && (
                <div className="space-y-6 w-full">
                  <div className="p-6 bg-rose-500/10 rounded-3xl border border-rose-500/20">
                    <p className="text-rose-400 text-sm leading-relaxed">
                      {errorMessage.includes("IDENT_MISSING") 
                        ? errorMessage.split("IDENT_MISSING: ")[1] 
                        : errorMessage}
                    </p>
                  </div>
                  {errorMessage.includes("IDENT_MISSING") ? (
                    <button 
                      onClick={() => window.location.href = "/dashboard/settings"}
                      className="w-full py-5 bg-gold-primary text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)]"
                    >
                      Update Profile Photo
                    </button>
                  ) : (
                    <button 
                      onClick={handleStartScan}
                      className="w-full py-5 bg-rose-500/20 text-rose-500 font-bold rounded-2xl hover:bg-rose-500/30 transition-all border border-rose-500/30"
                    >
                      Re-Initialize Engine
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-brown-secondary/40">
              <span className="flex items-center gap-2"><ShieldCheck size={12} /> Secure Auth</span>
              <div className="w-1 h-1 bg-brown-secondary/20 rounded-full" />
              <span className="flex items-center gap-2"><Sparkles size={12} /> AI Assisted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
