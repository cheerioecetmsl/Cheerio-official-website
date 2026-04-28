"use client";

import { useEffect, useState } from "react";
import { X, Trophy, Vote, LayoutGrid } from "lucide-react";
import { EngagementModule } from "@/types/engagement";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { PollRenderer } from "./engagement/PollRenderer";
import { GuessTheSenior } from "./engagement/GuessTheSenior";
import { MemoryMatch } from "./engagement/MemoryMatch";
import { ReactionSpeed } from "./engagement/ReactionSpeed";
import confetti from "canvas-confetti";

interface EngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: EngagementModule | null;
}

export function EngagementModal({ isOpen, onClose, module }: EngagementModalProps) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setIsComplete(false);
  }, [module?.id]);

  useEffect(() => {
    if (isComplete) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F5E6D3', '#4A3728']
      });
    }
  }, [isComplete]);

  if (!isOpen || !module) return null;

  const handleGameComplete = async (score: number) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "engagement_responses"), {
        moduleId: module.id,
        userId: user.uid,
        userName: user.displayName || "Archivist",
        score,
        timestamp: serverTimestamp()
      });
      setIsComplete(true);
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const renderModuleContent = () => {
    if (module.status === 'results') {
      return (
        <div className="text-center py-10">
          <h3 className="text-xl font-bold serif text-brown-primary italic mb-4">The Verdict is In</h3>
          <p className="text-brown-secondary text-[10px] uppercase tracking-widest leading-relaxed">
            Final tallies are being etched into the chronicles.<br/>Check back shortly for the revelation.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-12 h-12 border-2 border-gold-soft border-t-gold-primary rounded-full animate-spin" />
          </div>
        </div>
      );
    }

    if (isComplete) {
      return (
        <div className="text-center py-10 animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-green-100/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
            <Trophy className="text-green-600 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-brown-primary serif mb-2 uppercase tracking-tight">Challenge Conquered!</h3>
          <p className="text-brown-secondary text-[10px] uppercase tracking-widest leading-relaxed">Your contribution has been etched into the 2026 archives.</p>
          <button 
            onClick={onClose}
            className="mt-10 bg-brown-primary text-parchment px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-brown-primary/20 transition-all hover:scale-[1.02]"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    switch (module.type) {
      case 'poll':
        return <PollRenderer module={module} />;
      case 'game':
        const gameType = (module.config as any).gameType;
        if (gameType === 'guess-senior') return <GuessTheSenior module={module} onComplete={handleGameComplete} />;
        if (gameType === 'memory-match') return <MemoryMatch module={module} onComplete={handleGameComplete} />;
        if (gameType === 'reaction-speed') return <ReactionSpeed module={module} onComplete={handleGameComplete} />;
        return <div className="text-center py-10 italic text-brown-secondary">This trial is lost in the archives.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl theme-card rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-gold-soft/30 shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header with Close Button */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-6 md:p-10 bg-parchment/90 backdrop-blur-sm border-b border-gold-soft/20">
          <div className="flex items-center gap-4">
            <div className={`p-3 md:p-4 rounded-2xl md:rounded-3xl ${
              module.type === 'poll' ? "bg-blue-500/10 text-blue-600" : 
              module.type === 'game' ? "bg-purple-500/10 text-purple-600" : 
              "bg-gold-soft/20 text-brown-primary"
            }`}>
              {module.type === 'poll' ? <Vote size={20} className="md:w-6 md:h-6" /> : module.type === 'game' ? <LayoutGrid size={20} className="md:w-6 md:h-6" /> : <Trophy size={20} className="md:w-6 md:h-6" />}
            </div>
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-bold serif text-brown-primary uppercase tracking-tight leading-none line-clamp-1">{module.title}</h2>
              {module.description && <p className="text-brown-secondary italic serif mt-1 text-xs md:text-sm line-clamp-1">{module.description}</p>}
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-3 bg-brown-primary/5 hover:bg-brown-primary/10 rounded-full text-brown-primary transition-all active:scale-95 group"
          >
            <X size={20} className="transition-transform group-hover:rotate-90 duration-300" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 md:p-12 pt-4 md:pt-6">
          <div className="max-w-xl mx-auto w-full">
            {renderModuleContent()}
          </div>
        </div>

        {/* Footer/Progress Indicator if needed */}
        {module.type === 'game' && !isComplete && (
          <div className="p-4 bg-brown-primary/5 border-t border-gold-soft/10 text-center">
            <p className="text-[10px] font-bold text-brown-secondary uppercase tracking-[0.3em]">Cheerio 2026 Engagement System</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 115, 85, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 115, 85, 0.4);
        }
      `}</style>
    </div>
  );
}
