"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Trophy, Camera, Users, Megaphone } from "lucide-react";

interface Step {
  title: string;
  description: string;
  targetId: string;
  icon: any;
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

export function TutorialOverlay({ onComplete, isFaculty }: { onComplete: () => void; isFaculty?: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);

  const filteredSteps = steps.filter(step => {
    if (isFaculty && step.targetId === "stats-section") return false;
    return true;
  });

  useEffect(() => {
    const updateCoords = () => {
      const step = filteredSteps[currentStep];
      if (!step) return;
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        
        // Scroll into view if needed
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    // Delay slightly to ensure layout is settled
    const timer = setTimeout(() => {
      updateCoords();
      setIsReady(true);
    }, 500);

    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords);
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const activeStep = filteredSteps[currentStep];
  const Icon = activeStep?.icon;

  if (!isReady || !activeStep) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Background Dimmer with Spotlight Hole */}
      <div 
        className="absolute inset-0 bg-black/80 transition-all duration-700 pointer-events-auto"
        style={{
          maskImage: `radial-gradient(circle ${Math.max(coords.width, coords.height) / 1.5}px at ${coords.left + coords.width / 2}px ${coords.top + coords.height / 2}px, transparent 100%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${Math.max(coords.width, coords.height) / 1.5}px at ${coords.left + coords.width / 2}px ${coords.top + coords.height / 2}px, transparent 100%, black 100%)`
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute z-[110] pointer-events-auto"
          style={{
            top: activeStep.position === "bottom" ? coords.top + coords.height + 24 : 
                 activeStep.position === "top" ? coords.top - 280 : 
                 coords.top + coords.height / 2 - 120,
            left: activeStep.position === "right" ? coords.left + coords.width + 24 : 
                  activeStep.position === "left" ? coords.left - 340 : 
                  coords.left + coords.width / 2 - 160,
            width: "320px"
          }}
        >
          {/* Tooltip Card */}
          <div className="glass-card p-8 rounded-[2.5rem] border-gold/20 shadow-[0_32px_128px_rgba(0,0,0,0.8)] bg-zinc-900/90 backdrop-blur-xl relative overflow-hidden">
            {/* Pointer Arrow */}
            <div 
              className={`absolute w-4 h-4 bg-zinc-900 border-l border-t border-gold/20 rotate-45 transition-all ${
                activeStep.position === "bottom" ? "-top-2 left-1/2 -translate-x-1/2" :
                activeStep.position === "top" ? "-bottom-2 left-1/2 -translate-x-1/2 rotate-[225deg]" :
                activeStep.position === "right" ? "top-1/2 -left-2 -translate-y-1/2 -rotate-45" :
                "top-1/2 -right-2 -translate-y-1/2 rotate-[135deg]"
              }`}
            />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                  <Icon size={24} />
                </div>
                <button 
                  onClick={onComplete}
                  className="p-2 text-white/20 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gold uppercase tracking-[0.4em]">Step {currentStep + 1} of {filteredSteps.length}</span>
                <h3 className="text-2xl font-bold text-white serif">{activeStep.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed italic serif">
                  "{activeStep.description}"
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button 
                  onClick={handleNext}
                  className="flex-1 gold-button py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg"
                >
                  {currentStep === steps.length - 1 ? "Finish induction" : "Next Anchor"}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip Button (Bottom Right) */}
      <div className="fixed bottom-12 right-12 z-[110] pointer-events-auto">
        <button 
          onClick={onComplete}
          className="text-[10px] font-bold text-white/40 hover:text-gold uppercase tracking-[0.3em] transition-all flex items-center gap-2 group"
        >
          Skip Induction <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
