"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Trophy, Camera, Users, Megaphone } from "lucide-react";

interface Step {
  title: string;
  description: string;
  targetId: string;
  icon: React.ComponentType<{ size: number }>;
  position: "top" | "bottom" | "left" | "right";
}

const steps: Step[] = [
  {
    title: "Legacy Ledger",
    description: "Track your rank and Legacy XP as you archive the year's greatest moments.",
    targetId: "stats-section",
    icon: Trophy,
    position: "bottom"
  },
  {
    title: "Neural Face Discovery",
    description: "Our AI scanner finds you in the archives automatically. Check 'My Moments' to see your story unfold.",
    targetId: "scanner-nav",
    icon: Camera,
    position: "right"
  },
  {
    title: "The Community Hub",
    description: "Connect with Organizers, Participants, and our Batch Legends in the central directory.",
    targetId: "community-nav",
    icon: Users,
    position: "right"
  },
  {
    title: "The Pulse",
    description: "Stay synchronized with real-time updates and hype directly from the Architects.",
    targetId: "pulse-section",
    icon: Megaphone,
    position: "top"
  }
];

export function TutorialOverlay({ isOpen, onClose, onComplete, isFaculty }: { isOpen: boolean; onClose: () => void; onComplete?: () => void; isFaculty?: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const filteredSteps = useMemo(() => steps.filter(step => {
    if (isFaculty && step.targetId === "stats-section") return false;
    return true;
  }), [isFaculty]);

  useEffect(() => {
    if (!isOpen) return;

    const updateCoords = () => {
      const step = filteredSteps[currentStep];
      if (!step) return;
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateCoords();
    const interval = setInterval(updateCoords, 200);
    window.addEventListener("resize", updateCoords);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateCoords);
    };
  }, [currentStep, isOpen, filteredSteps]);

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (onComplete) onComplete();
      onClose();
    }
  };

  if (!isOpen || !filteredSteps[currentStep]) return null;

  const activeStep = filteredSteps[currentStep];
  const Icon = activeStep.icon;

  return (
    <div className="absolute inset-0 z-[100] pointer-events-none">
      {/* Dimmed Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 pointer-events-auto backdrop-blur-[2px]"
        onClick={onClose}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="absolute z-[110] pointer-events-auto"
          style={{
            top: activeStep.position === "bottom" ? coords.top + coords.height + 20 : 
                 activeStep.position === "top" ? coords.top - 220 : 
                 coords.top + coords.height / 2 - 100,
            left: Math.max(20, Math.min(window.innerWidth - 340, 
                  activeStep.position === "right" ? coords.left + coords.width + 20 : 
                  activeStep.position === "left" ? coords.left - 340 : 
                  coords.left + coords.width / 2 - 160)),
            width: "320px"
          }}
        >
          {/* Spotlight Highlight */}
          <div 
            className="fixed z-[-1] rounded-2xl border-2 border-gold/50 shadow-[0_0_40px_rgba(212,175,55,0.4)] bg-gold/5"
            style={{
              top: coords.top - window.scrollY - 10,
              left: coords.left - window.scrollX - 10,
              width: coords.width + 20,
              height: coords.height + 20,
              position: 'fixed'
            }}
          />

          {/* Tutorial Card */}
          <div className="glass-card p-6 rounded-[2rem] border-gold/30 shadow-2xl bg-zinc-900/95 backdrop-blur-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-gold/20 rounded-xl text-gold border border-gold/20">
                  <Icon size={20} />
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 text-white/20 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gold uppercase tracking-[0.3em]">Neural Link {currentStep + 1}/{filteredSteps.length}</span>
                <h3 className="text-xl font-bold text-white serif tracking-tight">{activeStep.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed italic serif">
                  &quot;{activeStep.description}&quot;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={handleNext}
                  className="flex-1 bg-gold text-ink py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {currentStep === filteredSteps.length - 1 ? "Complete Sync" : "Next Anchor"}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip Controls */}
      <div className="fixed bottom-8 right-8 z-[110] pointer-events-auto">
        <button 
          onClick={onClose}
          className="text-[9px] font-bold text-white/40 hover:text-gold uppercase tracking-[0.3em] transition-all flex items-center gap-2 group bg-zinc-900/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/5 shadow-xl hover:border-gold/20"
        >
          Skip Induction <X size={12} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>
    </div>
  );
}
