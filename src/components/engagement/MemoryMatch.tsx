"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Zap } from "lucide-react";

interface MemoryMatchProps {
  module: any;
  onComplete: (score: number) => void;
}

interface Card {
  id: string;
  img: string;
  name: string;
  flipped: boolean;
  matched: boolean;
}

export function MemoryMatch({ module, onComplete }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeniors() {
      let seniors: any[] = [];

      if (module.config?.gameAssets && module.config.gameAssets.length > 0) {
        seniors = module.config.gameAssets.map((url: string, index: number) => ({
          id: `asset-${index}`,
          name: `Senior ${index + 1}`,
          img: url
        }));
      } else {
        const q = query(collection(db, "users"), where("category", "==", "LEGEND"), where("photoURL", "!=", ""));
        const snap = await getDocs(q);
        seniors = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name, img: doc.data().photoURL })).slice(0, 6);
      }
      
      const cardPairs = [...seniors, ...seniors].map((s, index) => ({
        ...s,
        id: `${s.id}-${index}`,
        flipped: false,
        matched: false,
      }));

      setCards(cardPairs.sort(() => Math.random() - 0.5));
      setLoading(false);
    }
    fetchSeniors();
  }, [module.config?.gameAssets]);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [idx1, idx2] = flippedIndices;
      setMoves(m => m + 1);

      if (cards[idx1].img === cards[idx2].img) {
        setCards(prev => {
          const newCards = [...prev];
          newCards[idx1].matched = true;
          newCards[idx2].matched = true;
          return newCards;
        });
        setScore(s => s + 200);
        setFlippedIndices([]);
      } else {
        setTimeout(() => {
          setCards(prev => {
            const newCards = [...prev];
            newCards[idx1].flipped = false;
            newCards[idx2].flipped = false;
            return newCards;
          });
          setFlippedIndices([]);
        }, 1000);
      }
    }
  }, [flippedIndices, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      const bonus = Math.max(0, 1000 - moves * 20);
      onComplete(score + bonus);
    }
  }, [cards, score, moves, onComplete]);

  const handleFlip = (index: number) => {
    if (flippedIndices.length < 2 && !cards[index].flipped && !cards[index].matched) {
      setCards(prev => {
        const newCards = [...prev];
        newCards[index].flipped = true;
        return newCards;
      });
      setFlippedIndices(prev => [...prev, index]);
    }
  };

  if (loading) return <div className="text-center py-20 text-brown-primary serif italic animate-pulse">Forging the memory grid...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-brown-primary uppercase tracking-widest">Moves</span>
          <span className="text-xl font-bold tabular-nums text-brown-primary">{moves}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-gold-primary uppercase tracking-widest flex items-center gap-1">
            <Zap size={10} fill="currentColor" /> Score
          </span>
          <span className="text-xl font-bold tabular-nums text-gold-primary">{score}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <div 
            key={card.id}
            onClick={() => handleFlip(index)}
            className={`aspect-square relative cursor-pointer transition-all duration-500 transform-gpu preserve-3d ${card.flipped || card.matched ? "rotate-y-180" : ""}`}
          >
            {/* Front */}
            <div className={`absolute inset-0 bg-gold-soft/20 border-2 border-gold-soft/50 rounded-xl flex items-center justify-center backface-hidden ${card.matched ? "opacity-0" : ""}`}>
              <div className="w-4 h-4 rounded-full border border-gold-primary/30" />
            </div>
            {/* Back */}
            <div className="absolute inset-0 bg-white border-2 border-gold-primary rounded-xl overflow-hidden rotate-y-180 backface-hidden shadow-lg">
              <Image src={card.img} fill className="object-cover" alt="Card" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
