"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, onSnapshot, increment } from "firebase/firestore";
import { CheckCircle2 } from "lucide-react";

interface PollRendererProps {
  module: any;
}

export function PollRenderer({ module }: PollRendererProps) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>(module.config.votes || {});
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && module.config.voters?.includes(user.uid)) {
      setVoted(true);
    }

    // Live listener for votes
    const unsub = onSnapshot(doc(db, "engagement_modules", module.id), (doc) => {
      const data = doc.data();
      if (data?.config?.votes) {
        setVotes(data.config.votes);
        setTotalVotes(Object.values(data.config.votes as Record<string, number>).reduce((a, b) => a + b, 0));
      }
    });

    return () => unsub();
  }, [module.id, module.config.voters]);

  const handleVote = async (option: string) => {
    const user = auth.currentUser;
    if (!user || voted) return;

    try {
      const moduleRef = doc(db, "engagement_modules", module.id);
      await updateDoc(moduleRef, {
        [`config.votes.${option}`]: increment(1),
        "config.voters": arrayUnion(user.uid)
      });
      setVoted(true);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl md:text-2xl font-bold serif text-brown-primary px-2 leading-tight italic">
        "{module.config.question}"
      </h3>

      <div className={`grid gap-4 ${module.config.options.some((opt: any) => typeof opt === 'object' && opt.imageUrl) ? "grid-cols-2" : "grid-cols-1"}`}>
        {module.config.options.map((option: any) => {
          const isObject = typeof option === 'object';
          const text = isObject ? option.text : option;
          const imageUrl = isObject ? option.imageUrl : null;
          const voteCount = votes[text] || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          return (
            <button
              key={text}
              disabled={voted}
              onClick={() => handleVote(text)}
              className={`w-full relative overflow-hidden rounded-2xl transition-all duration-500 group ${
                voted 
                  ? "cursor-default bg-gold-soft/10 border border-gold-soft/30" 
                  : "bg-white border-2 border-gold-soft/50 hover:border-gold-primary hover:shadow-xl"
              } ${imageUrl ? "flex flex-col h-full" : "py-6"}`}
            >
              {/* Image Header */}
              {imageUrl && (
                <div className="w-full aspect-square overflow-hidden bg-zinc-100">
                  <img 
                    src={imageUrl} 
                    alt={text} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                </div>
              )}

              {/* Progress Bar Background */}
              {voted && (
                <div 
                  className="absolute inset-y-0 left-0 bg-gold-primary/20 transition-all duration-1000 ease-out z-0"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className={`relative px-6 py-4 flex flex-col gap-2 z-10 w-full ${imageUrl ? "flex-1 justify-between" : "flex-row justify-between items-center"}`}>
                <span className={`font-bold uppercase tracking-widest text-sm ${voted ? "text-brown-primary" : "text-brown-secondary group-hover:text-brown-primary"}`}>
                  {text}
                </span>
                
                {voted && (
                  <div className="flex items-center justify-between gap-3 w-full">
                    <span className="text-[10px] font-black text-brown-secondary/50 tabular-nums">{voteCount} Votes</span>
                    <span className="text-lg font-black text-brown-primary tabular-nums">{percentage}%</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {voted && (
        <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top duration-700">
           <div className="w-12 h-1 bg-gold-primary/30 rounded-full mb-2" />
           <p className="text-[10px] font-bold text-gold-primary uppercase tracking-[0.3em] flex items-center gap-2">
             <CheckCircle2 size={12} /> Vote Recorded In The Chronicles
           </p>
        </div>
      )}
    </div>
  );
}
