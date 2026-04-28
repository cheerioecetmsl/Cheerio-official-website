"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { CheckCircle2, XCircle, ArrowRight, Zap } from "lucide-react";

interface GuessTheSeniorProps {
  module: any;
  onComplete: (score: number) => void;
}

export function GuessTheSenior({ module, onComplete }: GuessTheSeniorProps) {
  const [seniors, setSeniors] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeniors() {
      if (module.config?.targetSenior?.name) {
        setSeniors([{ 
          id: 'target', 
          name: module.config.targetSenior.name, 
          photoURL: module.config.targetSenior.imageUrl 
        }]);
        setLoading(false);
        return;
      }

      const q = query(collection(db, "users"), where("category", "==", "LEGEND"), where("photoURL", "!=", ""));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Shuffle and pick 5
      setSeniors(data.sort(() => 0.5 - Math.random()).slice(0, 5));
      setLoading(false);
    }
    fetchSeniors();
  }, [module.config?.targetSenior]);

  const handleGuess = () => {
    const currentSenior = seniors[currentIndex];
    const isRight = guess.toLowerCase().trim() === currentSenior.name.toLowerCase().trim();
    
    setIsCorrect(isRight);
    if (isRight) setScore(s => s + 100);
  };

  const handleNext = () => {
    if (currentIndex < seniors.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setGuess("");
      setIsCorrect(null);
    } else {
      onComplete(score);
    }
  };

  if (loading) return <div className="text-center py-20 text-brown-primary serif italic animate-pulse">Summoning the Legends...</div>;
  if (seniors.length === 0) return <div className="text-center py-20 text-brown-secondary italic">No seniors found for this trial.</div>;

  const currentSenior = seniors[currentIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-4">
        <span className="text-[10px] font-bold text-brown-primary uppercase tracking-widest">Challenge {currentIndex + 1} / {seniors.length}</span>
        <div className="flex items-center gap-2 text-gold-primary">
           <Zap size={14} fill="currentColor" />
           <span className="text-sm font-bold tabular-nums">{score}</span>
        </div>
      </div>

      <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-[2rem] overflow-hidden border-2 border-gold-soft/30 shadow-2xl">
        <Image 
          src={currentSenior.photoURL}
          fill
          className={`object-cover transition-all duration-1000 ${isCorrect === null ? "blur-xl grayscale" : "blur-0 grayscale-0"}`}
          alt="Mystery Senior"
        />
        {isCorrect !== null && (
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300`}>
             {isCorrect ? (
               <div className="flex flex-col items-center text-green-400">
                 <CheckCircle2 size={64} />
                 <span className="text-lg font-bold uppercase tracking-widest mt-2">Correct</span>
               </div>
             ) : (
               <div className="flex flex-col items-center text-red-400">
                 <XCircle size={64} />
                 <span className="text-lg font-bold uppercase tracking-widest mt-2">Incorrect</span>
               </div>
             )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isCorrect === null ? (
          <>
            <input 
              type="text" 
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Who is this archivist?"
              className="w-full bg-gold-soft/10 border border-gold-soft/30 rounded-2xl px-6 py-4 text-brown-primary text-center font-bold uppercase tracking-widest text-sm focus:border-gold-primary outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
            />
            <button 
              onClick={handleGuess}
              disabled={!guess.trim()}
              className="w-full bg-brown-primary text-parchment font-bold py-4 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-brown-primary/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              Confirm Identity
            </button>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-brown-primary font-bold serif text-xl uppercase tracking-tighter">It was {currentSenior.name}</p>
            <button 
              onClick={handleNext}
              className="w-full bg-gold-primary text-black font-bold py-4 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-gold-primary/20 flex items-center justify-center gap-2"
            >
              {currentIndex < seniors.length - 1 ? "Next Challenge" : "Finish Trial"} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
