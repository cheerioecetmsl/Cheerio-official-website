"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, Award, Quote, CheckCircle } from "lucide-react";
import Image from "next/image";

export const SeniorInvitation = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
      {/* Cinematic Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-1000"
        onClick={onClose}
      />
      
      {/* Pop-up Container */}
      <div className="relative glass-card max-w-5xl w-full rounded-[4rem] border-gold/20 overflow-hidden animate-in zoom-in fade-in duration-1000 flex flex-col md:flex-row shadow-[0_64px_128px_rgba(0,0,0,1)]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-4 bg-gold text-ink rounded-full z-[110] hover:scale-110 active:scale-95 transition-all shadow-2xl"
        >
          <X size={24} />
        </button>

        {/* Left: Cinematic Visual */}
        <div className="w-full md:w-1/2 h-80 md:h-auto relative bg-zinc-900 group">
          <Image 
            src="/assets/senior_invite_hero.jpg" 
            alt="The Invitation" 
            fill 
            className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          <div className="absolute bottom-12 left-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 backdrop-blur-md rounded-full text-gold text-[10px] font-bold tracking-[0.3em] uppercase border border-gold/20">
              <Award size={14} /> Class of Distinction
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white serif leading-tight">
              A Legend is <br/> <span className="text-gold">Summoned.</span>
            </h2>
          </div>
        </div>

        {/* Right: Invitation Content */}
        <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center space-y-12 relative overflow-y-auto custom-scrollbar">
          {/* Background Decorative */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-gold text-[10px] font-bold tracking-[0.4em] uppercase">
              <Sparkles size={14} /> Official Proclamation
            </div>
            <h3 className="text-3xl font-bold text-brown-primary serif">Welcome Home, Legend.</h3>
            <p className="text-brown-primary/80 italic serif text-lg leading-relaxed">
              Archivist, your journey has been forged through grit and vision. As you transition into the halls of the Legends, your legacy must be preserved with absolute fidelity.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Quote className="text-gold" size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-brown-primary uppercase tracking-widest text-xs">Immortalize Your Story</h4>
                <p className="text-brown-secondary text-sm italic serif">Update your narrative in the Identity Forge to guide future generations.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-gold" size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-brown-primary uppercase tracking-widest text-xs">The Hall of Fame</h4>
                <p className="text-brown-secondary text-sm italic serif">Your profile will be pinned in the Legends directory for eternal recognition.</p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button 
              onClick={onClose}
              className="gold-button w-full py-6 rounded-3xl font-bold uppercase tracking-[0.4em] text-xs shadow-2xl flex items-center justify-center gap-4 group"
            >
              Accept Invitation <Sparkles className="group-hover:rotate-12 transition-transform" size={18} />
            </button>
            <p className="text-center mt-6 text-[9px] font-bold text-brown-secondary/70 uppercase tracking-[0.3em]">By accepting, you seal your legacy in the 2026 Archives.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
