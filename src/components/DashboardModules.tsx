"use client";

import { TrendingUp, Award, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export interface HypeUpdate {
  id: string;
  title: string;
  content: string;
  tag?: string;
  createdAt?: any;
  mediaGallery?: string[];
  date?: string;
}

export const HypeBoard = () => {
  const [updates, setUpdates] = useState<HypeUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time Hype Query
    const q = query(collection(db, "hype"), orderBy("createdAt", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HypeUpdate));
      setUpdates(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="theme-card p-8 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold-soft/20 rounded-lg text-gold-primary">
            <TrendingUp size={20} />
          </div>
          <h3 className="font-bold uppercase tracking-widest text-sm text-brown-primary">Notification Bar</h3>
        </div>
        <span className="text-[10px] font-bold text-brown-primary bg-gold-soft/20 px-2 py-1 rounded animate-pulse">LIVE</span>
      </div>

      <div className="space-y-6 flex-grow">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-brown-secondary/20 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : updates.length > 0 ? (
          updates.map((update) => (
            <div key={update.id} className="group cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] font-bold tracking-[0.2em] text-brown-primary uppercase">{update.tag || "Update"}</span>
                <span className="text-[9px] text-brown-secondary uppercase">
                  {update.createdAt?.toDate ? new Date(update.createdAt.toDate()).toLocaleDateString() : "Just now"}
                </span>
              </div>
              <h4 className="font-bold serif text-brown-primary group-hover:text-black transition-colors">{update.title}</h4>
              <p className="text-xs text-brown-secondary leading-relaxed mt-1">{update.content}</p>
              <div className="h-px w-full bg-brown-secondary/30 mt-4 group-last:hidden" />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <p className="text-brown-secondary/50 serif italic text-sm">The vault is silent... for now.</p>
          </div>
        )}
      </div>

      <button className="mt-8 text-[10px] font-bold uppercase tracking-widest text-brown-primary hover:underline">
        Archive Feed
      </button>
    </div>
  );
};

export const UserStats = ({ xp = 0, name = "Archivist" }) => {
  const level = Math.floor(xp / 100) + 1;
  const nextLevelXP = level * 100;
  const progress = (xp / nextLevelXP) * 100;

  return (
    <div className="theme-card p-6 md:p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl md:text-3xl font-bold serif text-brown-primary truncate max-w-[200px]">{name}</h2>
          <p className="text-[10px] text-brown-secondary font-bold uppercase tracking-[0.3em] mt-1">Archivist Rank</p>
        </div>
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-gold-primary flex items-center justify-center text-brown-primary font-bold serif text-lg md:text-2xl shadow-lg shadow-gold-soft/20 flex-shrink-0">
          {level}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brown-secondary">Legacy Progress</span>
            <span className="text-xs font-bold text-brown-primary tabular-nums">{xp} / {nextLevelXP} XP</span>
          </div>
          <div className="h-2 w-full bg-card-tone rounded-full overflow-hidden">
            <div 
              className="h-full bg-gold-primary transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="p-3 md:p-4 bg-card-tone rounded-2xl border border-gold-soft/30">
            <div className="flex items-center gap-2 mb-1">
              <Award size={14} className="text-gold-primary" />
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-brown-secondary">Badges</span>
            </div>
            <div className="text-lg md:text-xl font-bold serif text-brown-primary">--</div>
          </div>
          <div className="p-3 md:p-4 bg-card-tone rounded-2xl border border-gold-soft/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-gold-primary" />
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-brown-secondary">Streaks</span>
            </div>
            <div className="text-lg md:text-xl font-bold serif text-brown-primary">--</div>
          </div>
        </div>
      </div>
    </div>
  );
};
