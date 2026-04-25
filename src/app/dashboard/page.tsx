"use client";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Countdown } from "@/components/Countdown";
import { HypeBoard, UserStats } from "@/components/DashboardModules";
import { Trophy, TrendingUp, ChevronDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [pulseItems, setPulseItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          setLoading(false);
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/");
      }
    });

    // Real-time Leaderboard Query
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(5));
    const unsubscribeLeaderboard = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaderboard(users);
    });

    // Listen to the Pulse (Hype Board) - Last 3 items
    const pulseQuery = query(collection(db, "hype_board"), orderBy("createdAt", "desc"), limit(3));
    const unsubscribePulse = onSnapshot(pulseQuery, (snap) => {
      if (!snap.empty) {
        setPulseItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeLeaderboard();
      unsubscribePulse();
    };
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-parchment dark:bg-dark-bg text-ink dark:text-gold serif text-2xl animate-pulse">Consulting the Ledger...</div>;

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg transition-colors duration-700 pb-20">
      
      {/* Mobile-Friendly Header */}
      <div className="fixed top-0 left-0 w-full z-40 md:hidden flex justify-between items-center p-6 bg-dark-bg/80 backdrop-blur-md border-b border-gold/5">
        <div className="w-12 h-12" /> {/* Spacer for symmetry with the sidebar button if needed, or just remove */}
        <button 
          onClick={() => auth.signOut()}
          className="text-[10px] font-bold uppercase tracking-widest text-gold border border-gold/20 px-4 py-2 rounded-full active:bg-gold/10 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* 1. Dynamic Welcome & Stats Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in duration-1000 pt-32 md:pt-8">
        <div className="text-center space-y-4">
          <span className="text-gold uppercase tracking-[0.3em] md:tracking-[0.5em] text-[8px] md:text-[10px] font-bold serif">Cheerio-2026</span>
          <h1 className="text-4xl md:text-8xl font-bold text-ink dark:text-gold serif leading-tight">
            Welcome, <br/> {userData?.name?.split(' ')[0] || "Archivist"}
          </h1>
          <p className="text-sm md:text-xl italic serif text-ink/60 dark:text-dark-text/60">Guys it's that time of the year.</p>
        </div>

        <div className="w-full max-w-4xl px-2 md:px-0">
          <UserStats name={userData?.name} xp={userData?.xp} />
        </div>

        <div className="animate-bounce pt-8 md:pt-12">
          <ChevronDown className="text-gold/40" size={32} />
        </div>
      </section>

      {/* 2. Giant Countdown Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gold/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-20" />
        </div>
        
        <div className="w-full max-w-5xl z-10">
          <div className="text-center mb-10 md:mb-16 space-y-2">
            <h2 className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">The Final Reel</h2>
            <p className="text-3xl md:text-6xl font-bold serif text-ink dark:text-gold">T-Minus to Farewell</p>
          </div>
          <div className="scale-[0.8] md:scale-[1.75] origin-center py-10 md:py-20">
            <Countdown />
          </div>
        </div>
      </section>

      {/* 3. Sequential Hype Board Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 space-y-12 md:space-y-16">
        <div className="w-full max-w-3xl">
          {/* Pulse Card - Links to Hype Board */}
          <Link href="/dashboard/hype" className="block card-blur p-12 rounded-[3rem] relative group overflow-hidden border border-gold/10 hover:border-gold/30 transition-all duration-700 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">The Pulse</span>
              <div className="ml-auto px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
                <span className="text-[8px] font-bold text-gold uppercase animate-pulse">Live</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold serif text-ink dark:text-gold group-hover:translate-x-2 transition-transform duration-700">THE PULSE</h2>
              <p className="text-ink/60 dark:text-dark-text/60 italic serif text-xl">Real-time updates from the Architects.</p>
              
              <div className="pt-12 border-t border-gold/10 mt-12 space-y-12">
                {pulseItems.length > 0 ? (
                  pulseItems.map((item, i) => (
                    <div key={item.id} className={`space-y-4 ${i !== 0 ? "opacity-50 hover:opacity-100 transition-opacity" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">{item.tag}</span>
                        <div className="flex items-center gap-3">
                          {item.mediaGallery && item.mediaGallery.length > 0 && (
                            <span className="flex items-center gap-1 text-[8px] font-bold text-gold/60 uppercase tracking-widest">
                              <Layers size={10} /> {item.mediaGallery.length} Assets
                            </span>
                          )}
                          <span className="text-[10px] text-ink/40 dark:text-dark-text/40 font-bold uppercase">{item.date}</span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-ink dark:text-gold serif line-clamp-1">{item.title}</p>
                      <p className="text-ink/50 dark:text-dark-text/50 italic text-lg line-clamp-2">"{item.content}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-ink/40 dark:text-dark-text/40 italic serif text-xl">The vault is silent... for now.</p>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-12 right-12 flex items-center gap-3 text-gold opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold uppercase tracking-widest">Archive Feed</span>
              <ArrowUpRight size={16} />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Batch Rankings Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-ink text-white dark:bg-gold/5">
        <div className="text-center mb-10 md:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 rounded-full text-gold text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase">
            <Trophy size={14} /> Hall of Legacy
          </div>
          <h2 className="text-3xl md:text-6xl font-bold serif">Batch Rankings</h2>
          <p className="text-white/60 dark:text-dark-text/60 italic serif text-sm md:text-xl">Honoring the legends of the 2026 story.</p>
        </div>

        <div className="w-full max-w-4xl glass-card rounded-[3rem] border-gold/10 overflow-hidden bg-white/5 backdrop-blur-sm">
          {leaderboard.length > 0 ? leaderboard.map((user, i) => (
            <div key={user.id} className="flex items-center gap-4 md:gap-8 p-4 md:p-8 border-b border-gold/5 last:border-none hover:bg-gold/5 transition-all">
              <div className="text-2xl md:text-3xl font-bold serif text-gold/40 w-8 md:w-12 text-center">#{i + 1}</div>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gold/20 shadow-xl flex-shrink-0 bg-gold/10">
                <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-full h-full object-cover" alt={user.name} />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-sm md:text-xl font-bold serif text-ink dark:text-gold uppercase tracking-widest truncate">{user.name}</h3>
                <p className="text-[8px] md:text-xs text-ink/40 dark:text-dark-text/40 font-bold uppercase tracking-widest truncate">Rank: {user.rank || "Archivist"} | {user.memoryCount || 0} Memories</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl md:text-3xl font-bold text-gold tabular-nums">{user.xp || 0}</div>
                <div className="text-[8px] md:text-[10px] font-bold text-ink/30 dark:text-dark-text/30 uppercase tracking-[0.2em]">Legacy XP</div>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center text-ink/20 dark:text-gold/20 serif italic">No legends recorded yet.</div>
          )}
          <div className="p-8 text-center bg-gold/5">
            <Link href="/dashboard/community/participants" className="text-gold font-bold uppercase tracking-[0.3em] text-xs hover:underline flex items-center justify-center gap-2">
              View All Archivists <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

const ArrowRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
