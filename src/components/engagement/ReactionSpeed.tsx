"use client";

import { useState, useEffect, useRef } from "react";
import { Zap, Timer, Trophy } from "lucide-react";

interface ReactionSpeedProps {
  module: any;
  onComplete: (score: number) => void;
}

type GameState = "WAITING" | "READY" | "CLICK_NOW" | "RESULT" | "TOO_SOON";

export function ReactionSpeed({ module, onComplete }: ReactionSpeedProps) {
  const [gameState, setGameState] = useState<GameState>("WAITING");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTrial = () => {
    setGameState("READY");
    const delay = 2000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setGameState("CLICK_NOW");
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (gameState === "READY") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState("TOO_SOON");
    } else if (gameState === "CLICK_NOW") {
      const endTime = Date.now();
      const diff = endTime - startTimeRef.current;
      setReactionTime(diff);
      setAttempts(prev => [...prev, diff]);
      setGameState("RESULT");
    }
  };

  const finishGame = () => {
    const average = attempts.reduce((a, b) => a + b, 0) / attempts.length;
    // Score inversely proportional to reaction time. e.g. 250ms = 1000 pts
    const score = Math.round(Math.max(0, 2000 - average * 4));
    onComplete(score);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-8 text-center">
      <div className="flex justify-between items-center px-4">
        <span className="text-[10px] font-bold text-brown-primary uppercase tracking-widest">Trials: {attempts.length} / 3</span>
        {attempts.length > 0 && (
          <span className="text-[10px] font-bold text-gold-primary uppercase tracking-widest">Best: {Math.min(...attempts)}ms</span>
        )}
      </div>

      <div 
        onClick={handleClick}
        className={`w-full aspect-[4/3] rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-4 ${
          gameState === "WAITING" ? "bg-parchment border-gold-soft/30" :
          gameState === "READY" ? "bg-red-500/20 border-red-500/50" :
          gameState === "CLICK_NOW" ? "bg-green-500 border-green-400 shadow-[0_0_50px_rgba(34,197,94,0.4)] scale-105" :
          gameState === "TOO_SOON" ? "bg-zinc-800 border-zinc-700" :
          "bg-gold-soft/10 border-gold-primary"
        }`}
      >
        {gameState === "WAITING" && (
          <div className="space-y-4 animate-bounce">
            <Timer size={48} className="text-brown-primary mx-auto opacity-50" />
            <p className="text-brown-primary font-bold uppercase tracking-widest text-sm">Tap to Start Trial</p>
          </div>
        )}
        
        {gameState === "READY" && (
          <p className="text-red-600 font-black text-3xl uppercase tracking-tighter">Wait for Green...</p>
        )}

        {gameState === "CLICK_NOW" && (
          <div className="flex flex-col items-center">
            <Zap size={64} fill="white" className="text-white animate-pulse" />
            <p className="text-white font-black text-5xl uppercase tracking-tighter mt-4">TAP!</p>
          </div>
        )}

        {gameState === "TOO_SOON" && (
          <p className="text-zinc-400 font-bold text-xl uppercase tracking-widest">Too Early!</p>
        )}

        {gameState === "RESULT" && (
          <div className="space-y-2">
            <p className="text-gold-primary font-black text-6xl tabular-nums">{reactionTime}ms</p>
            <p className="text-brown-primary font-bold uppercase tracking-[0.2em] text-xs">Lightning Reflexes</p>
          </div>
        )}
      </div>

      <div className="px-4">
        {gameState === "WAITING" ? (
          <button 
            onClick={startTrial}
            className="w-full bg-brown-primary text-parchment font-bold py-4 rounded-2xl uppercase tracking-[0.2em] text-xs"
          >
            Enter the Void
          </button>
        ) : (gameState === "RESULT" || gameState === "TOO_SOON") && (
          <button 
            onClick={attempts.length < 3 ? startTrial : finishGame}
            className="w-full bg-gold-primary text-black font-bold py-4 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-gold-primary/20"
          >
            {attempts.length < 3 ? "Next Trial" : "Claim Your Ranking"}
          </button>
        )}
      </div>

      {attempts.length > 0 && (
        <div className="flex justify-center gap-4">
          {attempts.map((t, i) => (
            <div key={i} className="px-3 py-1 bg-gold-soft/10 rounded-full border border-gold-soft/30 text-[10px] font-bold text-brown-secondary tabular-nums">
              {t}ms
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
