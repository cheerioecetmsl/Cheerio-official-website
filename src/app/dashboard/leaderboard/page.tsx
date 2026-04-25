"use client";

import { Trophy, Medal, Award, Star } from "lucide-react";
import { ReturnToDashboard } from "@/components/Sidebar";

const mockLeaderboard = [
  { id: 1, name: "Sankha Subhra", xp: 1250, count: 45, level: 25 },
  { id: 2, name: "Riddhi Dutta", xp: 980, count: 32, level: 19 },
  { id: 3, name: "Ananya Ray", xp: 850, count: 28, level: 17 },
  { id: 4, name: "Ishaan Gupta", xp: 720, count: 21, level: 14 },
  { id: 5, name: "Meera Oberoi", xp: 600, count: 18, level: 12 },
];

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8">
      <ReturnToDashboard />
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full text-gold text-[10px] font-bold tracking-[0.3em] uppercase">
            <Trophy size={14} /> The Hall of Legacy
          </div>
          <h1 className="text-5xl font-bold text-ink dark:text-gold serif">Top Archivists.</h1>
          <p className="text-ink/60 dark:text-dark-text/60 italic serif text-lg">
            Honoring those who have preserved the most frames of our story.
          </p>
        </div>

        {/* Podium / Top 3 */}
        <div className="grid grid-cols-3 gap-4 items-end pt-12">
          {/* 2nd Place */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full border-2 border-slate-300 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6" className="w-full h-full object-cover" alt="2nd" />
            </div>
            <div className="h-32 w-full bg-slate-300/20 dark:bg-slate-300/10 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-slate-300">
              <Medal size={24} className="text-slate-400 mb-2" />
              <span className="text-[10px] font-bold text-slate-400">980 XP</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full border-4 border-gold overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" className="w-full h-full object-cover" alt="1st" />
            </div>
            <div className="h-48 w-full bg-gold/20 dark:bg-gold/10 rounded-t-3xl flex flex-col items-center justify-center border-t-4 border-gold relative">
              <Trophy size={40} className="text-gold mb-2" />
              <span className="text-sm font-bold text-gold">1250 XP</span>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <Star size={24} className="text-gold fill-gold animate-bounce" />
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full border-2 border-amber-600 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" className="w-full h-full object-cover" alt="3rd" />
            </div>
            <div className="h-24 w-full bg-amber-600/20 dark:bg-amber-600/10 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-600">
              <Medal size={24} className="text-amber-700 mb-2" />
              <span className="text-[10px] font-bold text-amber-700">850 XP</span>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="glass-card rounded-[2rem] border-gold/10 overflow-hidden">
          {mockLeaderboard.map((user, i) => (
            <div key={user.id} className="flex items-center gap-6 p-6 border-b border-gold/5 last:border-none hover:bg-gold/5 transition-colors">
              <div className="w-8 text-center font-bold serif text-gold text-lg">#{i + 1}</div>
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gold/20">
                <img src={`https://i.pravatar.cc/150?u=${user.id}`} className="w-full h-full object-cover" alt={user.name} />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-ink dark:text-gold uppercase tracking-widest text-xs">{user.name}</h3>
                <p className="text-[10px] text-ink/40 dark:text-dark-text/40 font-bold uppercase tracking-widest">Level {user.level} | {user.count} Contributions</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gold tabular-nums">{user.xp}</div>
                <div className="text-[9px] font-bold text-ink/30 dark:text-dark-text/30 uppercase tracking-widest">XP Points</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
