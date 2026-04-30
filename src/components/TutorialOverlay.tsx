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
    description: "Track your rank and XP.",
    targetId: "stats-section",
    icon: Trophy,
    position: "bottom"
  },
  {
    title: "Neural Face Discovery",
    description: "AI scanner finds your face.",
    targetId: "scanner-nav",
    icon: Camera,
    position: "right"
  },
  {
    title: "The Community Hub",
    description: "Connect with the 2026 Batch.",
    targetId: "community-nav",
    icon: Users,
    position: "right"
  },
  {
    title: "The Pulse",
    description: "Real-time updates from Architects.",
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

  // Auto-scroll and handle mobile sidebar
  useEffect(() => {
    if (!isOpen) return;
    const step = filteredSteps[currentStep];
    if (!step) return;

    const isMobile = window.innerWidth < 768;
    const isSidebarItem = ["scanner-nav", "community-nav"].includes(step.targetId);

    if (isMobile && isSidebarItem) {
      window.dispatchEvent(new CustomEvent('open-sidebar'));
    } else if (isMobile && !isSidebarItem) {
      window.dispatchEvent(new CustomEvent('close-sidebar'));
    }

    // Small delay so layout animations (like sidebar opening) settle before we scroll
    const t = setTimeout(() => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, isMobile && isSidebarItem ? 300 : 120);

    return () => clearTimeout(t);
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isSidebarItem = activeStep.targetId.includes('nav');
  const effectivePosition = (isMobile && isSidebarItem) ? "bottom" : activeStep.position;

  const holeTop = coords.top - (typeof window !== 'undefined' ? window.scrollY : 0) - 10;
  const holeLeft = coords.left - (typeof window !== 'undefined' ? window.scrollX : 0) - 10;
  const holeWidth = coords.width + 20;
  const holeHeight = coords.height + 20;

  const punchPath = `polygon(
    0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 
    ${holeLeft}px ${holeTop}px, 
    ${holeLeft}px ${holeTop + holeHeight}px, 
    ${holeLeft + holeWidth}px ${holeTop + holeHeight}px, 
    ${holeLeft + holeWidth}px ${holeTop}px, 
    ${holeLeft}px ${holeTop}px
  )`;

  return (
    <div className="absolute inset-0 z-[100] pointer-events-none">
      {/* Blurred Backdrop with Punch-Through Hole */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-parchment-base/60 backdrop-blur-[3px] pointer-events-auto"
        style={{ clipPath: punchPath }}
        onClick={onClose}
      />

      {/* Decorative Border for the Hole */}
      <div 
        className="fixed z-[101] border-2 border-gold-soft/40 rounded-2xl pointer-events-none shadow-[0_0_20px_rgba(107,68,35,0.2)] transition-all duration-300"
        style={{
          top: holeTop,
          left: holeLeft,
          width: holeWidth,
          height: holeHeight
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="absolute z-[110] pointer-events-auto"
          style={{
            top: effectivePosition === "bottom" ? coords.top + coords.height + 20 : 
                 effectivePosition === "top" ? coords.top - 200 : 
                 coords.top + coords.height / 2 - 80,
            left: isMobile ? Math.max(10, (window.innerWidth - 240) / 2) : 
                  Math.max(20, Math.min(window.innerWidth - 340, 
                  effectivePosition === "right" ? coords.left + coords.width + 20 : 
                  effectivePosition === "left" ? coords.left - 340 : 
                  coords.left + coords.width / 2 - 160)),
            width: isMobile ? "240px" : "320px"
          }}
        >
          {/* Tutorial Card */}
          <div className={`glass-card ${isMobile ? 'p-3.5 rounded-[1.5rem]' : 'p-6 rounded-[2rem]'} border-gold-soft/30 shadow-2xl bg-card-tone/95 backdrop-blur-xl transition-all duration-300`}>
            <div className={isMobile ? "space-y-2" : "space-y-4"}>
              <div className="flex items-center justify-between">
                <div className={`${isMobile ? 'p-1.5 rounded-lg' : 'p-2.5 rounded-xl'} bg-gold-soft/20 text-gold-primary border border-gold-soft/20`}>
                  <Icon size={isMobile ? 14 : 20} />
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 text-brown-primary/20 hover:text-brown-primary transition-colors"
                >
                  <X size={isMobile ? 12 : 16} />
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[7px] md:text-[9px] font-bold text-gold-primary uppercase tracking-[0.3em]">Link {currentStep + 1}/{filteredSteps.length}</span>
                <h3 className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold text-brown-primary serif tracking-tight leading-tight`}>{activeStep.title}</h3>
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-brown-primary/60 leading-relaxed italic serif`}>
                  &quot;{activeStep.description}&quot;
                </p>
              </div>

              <div className={`flex items-center gap-3 ${isMobile ? 'pt-1' : 'pt-2'}`}>
                <button 
                  onClick={handleNext}
                  className={`flex-1 bg-gold-primary text-black ${isMobile ? 'py-2 rounded-lg text-[8px]' : 'py-3.5 rounded-xl text-[10px]'} font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-95 transition-all`}
                >
                  {currentStep === filteredSteps.length - 1 ? "Complete" : "Next"}
                  <ChevronRight size={isMobile ? 10 : 14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip Controls */}
      <div className="fixed bottom-6 right-6 z-[110] pointer-events-auto">
        <button 
          onClick={onClose}
          className={`${isMobile ? 'text-[7px] px-3 py-1.5' : 'text-[9px] px-5 py-2.5'} font-bold text-brown-primary/40 hover:text-gold-primary uppercase tracking-[0.3em] transition-all flex items-center gap-2 group bg-card-tone/50 backdrop-blur-md rounded-full border border-brown-primary/5 shadow-xl hover:border-gold/20`}
        >
          Skip <X size={isMobile ? 10 : 12} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>
    </div>
  );
}
