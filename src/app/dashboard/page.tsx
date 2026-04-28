"use client";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Countdown } from "@/components/Countdown";
import { HypeBoard, UserStats } from "@/components/DashboardModules";
import { Trophy, TrendingUp, ChevronDown, ArrowUpRight, Files } from "lucide-react";
import Link from "next/link";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import Image from "next/image";
import { HypeUpdate } from "@/components/DashboardModules";
import { SeniorInvitation } from "@/components/SeniorInvitation";
import { PulseOverlay } from "@/components/PulseOverlay";
import { Zap } from "lucide-react";
import { LogoutModal } from "@/components/LogoutModal";
import { archiveProfilePhoto } from "@/lib/image-archive";
import { EngagementModal } from "@/components/EngagementModal";
import { EngagementModule } from "@/types/engagement";

interface UserArchiveData {
  name: string;
  category: string;
  gender?: string;
  hasSeenTutorial?: boolean;
  xp: number;
  rank?: string;
  photoURL?: string;
  memoryCount?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [pulseItems, setPulseItems] = useState<HypeUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSeniorInvite, setShowSeniorInvite] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [activeModule, setActiveModule] = useState<EngagementModule | null>(null);
  const [showEngagement, setShowEngagement] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasTriggeredRef = useRef({ tutorial: false, invite: false });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);

          // Sequential flow: for LEGENDs, invite first → tutorial after
          const needsTutorial = data.hasSeenTutorial !== true;
          const needsInvite   = data.category === "LEGEND" && data.hasSeenSeniorInvite !== true;

          if (needsInvite && !hasTriggeredRef.current.invite) {
            hasTriggeredRef.current.invite = true;
            setShowSeniorInvite(true); // tutorial will chain when invite closes
          } else if (needsTutorial && !hasTriggeredRef.current.tutorial) {
            hasTriggeredRef.current.tutorial = true;
            setShowTutorial(true);
          }

          // Auto-migrate Google photos to Cloudinary if detected
          if (data.photoURL && data.photoURL.includes('googleusercontent.com')) {
            console.log("[Migration] Google photo detected, archiving to Cloudinary...");
            archiveProfilePhoto(data.photoURL).then(async (archivedURL) => {
              if (archivedURL !== data.photoURL) {
                await updateDoc(docRef, { photoURL: archivedURL });
                setUserData((prev: any) => ({ ...prev, photoURL: archivedURL }));
              }
            });
          }

          setLoading(false);
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/");
      }
    });

    // Real-time Leaderboard Query (Simplified to avoid index requirement)
    const q = query(
      collection(db, "users"), 
      orderBy("xp", "desc"), 
      limit(20)
    );
    const unsubscribeLeaderboard = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(u => u.category === "STUDENT" || u.category === "LEGEND")
        .slice(0, 10);
      setLeaderboard(users);
    });

    // Listen to the Pulse (Hype Board) - Last 3 items
    const pulseQuery = query(collection(db, "hype_board"), orderBy("createdAt", "desc"), limit(3));
    const unsubscribePulse = onSnapshot(pulseQuery, (snap) => {
      if (!snap.empty) {
        setPulseItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      }
    });

    // Listen for Active Engagement Modules
    const engagementQuery = query(
      collection(db, "engagement_modules"), 
      where("status", "==", "active"),
      limit(1)
    );
    const unsubscribeEngagement = onSnapshot(engagementQuery, (snap) => {
      if (!snap.empty) {
        const moduleData = { id: snap.docs[0].id, ...snap.docs[0].data() } as EngagementModule;
        setActiveModule(moduleData);
      } else {
        setActiveModule(null);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeLeaderboard();
      unsubscribePulse();
      unsubscribeEngagement();
    };
  }, [router]);

  // Separate effect for rank calculation to avoid auth race conditions
  useEffect(() => {
    if (!userData?.xp) return;

    const rankQuery = query(collection(db, "users"), where("xp", ">", userData.xp));
    const unsubscribeRank = onSnapshot(rankQuery, (snap) => {
      setUserRank(snap.size + 1);
    });

    return () => unsubscribeRank();
  }, [userData?.xp]);

  const handleTutorialComplete = async () => {
    if (auth.currentUser) {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        hasSeenTutorial: true
      });
      setShowTutorial(false);
    }
  };

  const handleSeniorInviteComplete = async () => {
    if (auth.currentUser) {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        hasSeenSeniorInvite: true
      });
      setShowSeniorInvite(false);
      // Chain: show tutorial next if not yet seen
      if (userData && userData.hasSeenTutorial !== true && !hasTriggeredRef.current.tutorial) {
        hasTriggeredRef.current.tutorial = true;
        setShowTutorial(true);
      }
    }
  };

  if (!mounted || loading) return <div className="theme-cinematic min-h-screen flex items-center justify-center text-brown-primary serif text-2xl animate-pulse">Consulting the Ledger...</div>;

  const isFaculty = userData?.category === "FACULTY";

  return (
    <main className="transition-colors duration-700 pb-20">
      
      {/* Mobile-Friendly Header */}
      <div className="fixed top-0 left-0 w-full z-40 md:hidden flex justify-between items-center p-6 bg-brown-primary/80 backdrop-blur-md border-b border-gold-soft/30">
        <div className="w-12 h-12" />
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="text-[10px] font-bold uppercase tracking-widest text-black border border-brown-primary/50 px-4 py-2 rounded-full active:bg-gold-soft/20 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* 1. Dynamic Welcome & Stats Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in duration-1000 pt-32 md:pt-8">

        <div className="text-center space-y-4">
          <span className="text-brown-secondary uppercase tracking-[0.3em] md:tracking-[0.5em] text-[8px] md:text-[10px] font-bold serif">
            {isFaculty ? "Faculty of Excellence" : "Cheerio-2026"}
          </span>
          <h1 className="text-4xl md:text-8xl font-bold text-brown-primary serif leading-tight">
            Welcome, <br/> {userData?.name?.split(' ')[0] || "Archivist"} {isFaculty ? userData?.gender : ""}
          </h1>
          <p className="text-sm md:text-xl italic serif text-brown-secondary">
            {isFaculty ? "Your contribution to our legacy is immeasurable." : "Guys it's that time of the year."}
          </p>

          {/* Engagement Button Section */}
          {!isFaculty && (
            <div className="pt-4 flex justify-center animate-in slide-in-from-bottom duration-1000">
              {/* Special logic: Block LEGENDS from Polls */}
              {activeModule?.type === 'poll' && userData?.category === 'LEGEND' ? (
                <div className="flex items-center gap-3 px-8 py-3 rounded-full font-bold text-[10px] md:text-[12px] uppercase tracking-[0.2em] bg-zinc-200/10 text-zinc-400 border border-zinc-200/20 italic">
                  Polls for Juniors Only
                </div>
              ) : (
                <button 
                  onClick={() => activeModule && setShowEngagement(true)}
                  disabled={!activeModule}
                  className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold text-[10px] md:text-[12px] uppercase tracking-[0.2em] transition-all duration-500 border ${
                    activeModule 
                      ? "bg-gold-soft/20 text-brown-primary border-gold-soft/50 hover:bg-gold-soft/40 shadow-xl shadow-gold-soft/10 animate-pulse" 
                      : "bg-zinc-200/10 text-zinc-400 border-zinc-200/20 cursor-not-allowed"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${activeModule ? "bg-gold-primary animate-ping" : "bg-zinc-500"}`} />
                  {activeModule 
                    ? (activeModule.type === 'poll' ? "New Batch Poll" : activeModule.type === 'game' ? "Active Mini-Game" : "View Results") 
                    : "No Active Events"}
                </button>
              )}
            </div>
          )}
        </div>

        {!isFaculty && (
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl px-2 md:px-0" id="stats-section">
            <div className="flex-grow">
              <UserStats name={userData?.name} xp={userData?.xp} />
            </div>
            <button 
              onClick={() => router.push('/dashboard/my-moments')}
              className="md:w-64 h-full bg-gold-soft/20 hover:bg-gold-soft/40 border border-gold-soft/40 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 transition-all group"
            >
              <div className="p-3 bg-gold-soft/20 rounded-2xl text-brown-primary group-hover:scale-110 transition-transform">
                <Zap size={24} fill="currentColor" />
              </div>
              <div className="text-center">
                <p className="text-brown-primary font-bold uppercase tracking-[0.1em] text-[11px] leading-tight mb-1">Face Discovery</p>
                <p className="text-brown-secondary/80 text-[9px] font-bold italic leading-relaxed">
                  Do you want to find your face in the sea of images in cheerio-2026? Click here.
                </p>
              </div>
            </button>
          </div>
        )}

        <PulseOverlay isOpen={showPulse} onClose={() => setShowPulse(false)} />

        <div className="animate-bounce pt-8 md:pt-12">
          <ChevronDown className="text-brown-primary/50" size={32} />
        </div>
      </section>

      {/* 2. Giant Countdown Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-parchment-contrast/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-20" />
        </div>
        
        <div className="w-full max-w-5xl z-10">
          <div className="text-center mb-10 md:mb-16 space-y-2">
            <h2 className="text-brown-secondary uppercase tracking-[0.4em] text-[10px] font-bold">The Final Reel</h2>
            <p className="text-3xl md:text-6xl font-bold serif text-brown-primary">T-Minus to Farewell</p>
          </div>
          <div className="scale-[0.8] md:scale-[1.75] origin-center py-10 md:py-20">
            <Countdown />
          </div>
        </div>
      </section>

      {/* 3. Sequential Hype Board Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 space-y-12 md:space-y-16">
        <div className="w-full max-w-3xl" id="pulse-section">
          <div 
            onClick={() => router.push("/dashboard/hype")}
            className="block theme-card p-12 rounded-[3rem] relative group cursor-pointer overflow-hidden border border-gold-soft/30 hover:border-gold-primary/50 transition-all duration-700"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gold-soft/30 rounded-2xl text-brown-primary">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brown-primary">Notification Bar</span>
              <div className="ml-auto flex items-center gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/dashboard/history");
                  }}
                  className="px-4 py-1.5 bg-brown-primary/10 hover:bg-brown-primary/20 rounded-full border border-brown-primary/20 text-[8px] font-bold text-brown-primary uppercase tracking-widest transition-all"
                >
                  History
                </button>
                <div className="px-3 py-1 bg-gold-soft/20 rounded-full border border-gold-soft/40">
                  <span className="text-[8px] font-bold text-brown-primary uppercase animate-pulse">Live</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold serif text-brown-primary group-hover:translate-x-2 transition-transform duration-700 uppercase">Notifications</h2>
              <p className="text-brown-secondary italic serif text-xl">Real-time updates from the Architects.</p>
              
              <div className="pt-12 border-t border-brown-secondary/30 mt-12 space-y-12">
                {pulseItems.length > 0 ? (
                  pulseItems.map((item, i) => (
                    <div key={item.id} className={`space-y-4 ${i !== 0 ? "opacity-50 hover:opacity-100 transition-opacity" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-brown-primary uppercase tracking-[0.3em]">{item.tag}</span>
                        <div className="flex items-center gap-3">
                          {item.mediaGallery && item.mediaGallery.length > 0 && (
                            <span className="flex items-center gap-1 text-[8px] font-bold text-brown-primary/70 uppercase tracking-widest">
                              <Files size={10} /> {item.mediaGallery.length} Assets
                            </span>
                          )}
                          <span className="text-[10px] text-brown-secondary font-bold uppercase">{item.date}</span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-brown-primary serif line-clamp-1">{item.title}</p>
                      <p className="text-brown-secondary italic text-lg line-clamp-2">&quot;{item.content}&quot;</p>
                    </div>
                  ))
                ) : (
                  <p className="text-brown-secondary/60 italic serif text-xl">The vault is silent... for now.</p>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-12 right-12 flex items-center gap-3 text-brown-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold uppercase tracking-widest">Archive Feed</span>
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Batch Rankings Section - Only for students */}
      {!isFaculty && (
        <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-parchment-contrast">
          <div className="text-center mb-10 md:mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-soft/30 rounded-full text-brown-primary text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase">
              <Trophy size={14} /> Hall of Legacy
            </div>
            <h2 className="text-3xl md:text-6xl font-bold serif text-brown-primary">Batch Rankings</h2>
            <p className="text-brown-secondary italic serif text-sm md:text-xl">Honoring the legends of the 2026 story.</p>
          </div>

          <div className="w-full max-w-4xl theme-card rounded-[3rem] overflow-hidden">
            {leaderboard.length > 0 ? (
              <>
                {leaderboard.map((user, i) => (
                  <div key={user.id} className={`flex items-center gap-4 md:gap-8 p-4 md:p-8 border-b border-brown-secondary/20 last:border-none hover:bg-gold-soft/10 transition-all ${user.id === auth.currentUser?.uid ? "bg-gold-soft/20 border-l-4 border-l-gold-primary" : ""}`}>
                    <div className="text-2xl md:text-3xl font-bold serif text-brown-primary/60 w-8 md:w-12 text-center">#{i + 1}</div>
                    <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gold-soft/50 shadow-xl flex-shrink-0 bg-gold-soft/20">
                      <Image 
                        src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                        fill
                        sizes="64px"
                        className="object-cover" 
                        alt={user.name} 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
                        }}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-sm md:text-xl font-bold serif text-brown-primary uppercase tracking-widest truncate">{user.name}</h3>
                      <p className="text-[8px] md:text-xs text-brown-secondary font-bold uppercase tracking-widest truncate">Rank: {user.rank || "Archivist"} | {user.memoryCount || 0} Memories</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl md:text-3xl font-bold text-brown-primary tabular-nums">{user.xp || 0}</div>
                      <div className="text-[8px] md:text-[10px] font-bold text-brown-secondary/70 uppercase tracking-[0.2em]">Legacy XP</div>
                    </div>
                  </div>
                ))}

                {/* Show Current User if not in Top 10 */}
                {userRank && userRank > 10 && (
                  <>
                    <div className="p-4 text-center text-brown-primary/50 italic serif border-b border-brown-secondary/20">... descending into the archives ...</div>
                    <div className="flex items-center gap-4 md:gap-8 p-4 md:p-8 bg-gold-soft/20 border-l-4 border-l-gold-primary">
                      <div className="text-2xl md:text-3xl font-bold serif text-brown-primary w-8 md:w-12 text-center">#{userRank}</div>
                      <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gold-primary shadow-xl flex-shrink-0">
                        <Image 
                          src={userData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} 
                          fill
                          sizes="64px"
                          className="object-cover" 
                          alt="You" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`;
                          }}
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="text-sm md:text-xl font-bold serif text-brown-primary uppercase tracking-widest truncate">Your Station</h3>
                        <p className="text-[8px] md:text-xs text-brown-secondary font-bold uppercase tracking-widest truncate">{userData.rank || "Archivist"} | {userData.memoryCount || 0} Memories</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl md:text-3xl font-bold text-brown-primary tabular-nums">{userData.xp || 0}</div>
                        <div className="text-[8px] md:text-[10px] font-bold text-brown-secondary/70 uppercase tracking-[0.2em]">Legacy XP</div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="p-20 text-center text-brown-secondary/50 serif italic">No legends recorded yet.</div>
            )}
            <div className="p-8 text-center bg-brown-secondary/10">
              <Link href="/dashboard/community/participants" className="text-brown-primary font-bold uppercase tracking-[0.3em] text-xs hover:underline flex items-center justify-center gap-2">
                View All Archivists <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Sequential overlays: invitation first — tutorial is blocked until invite is gone */}
      <SeniorInvitation
        isOpen={showSeniorInvite}
        onClose={handleSeniorInviteComplete}
      />
      <TutorialOverlay
        isOpen={showTutorial && !showSeniorInvite}
        onClose={() => setShowTutorial(false)}
        isFaculty={isFaculty}
        onComplete={handleTutorialComplete}
      />
      <EngagementModal 
        isOpen={showEngagement}
        onClose={() => setShowEngagement(false)}
        module={activeModule}
      />
      <LogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
      />
    </main>
  );
}

const ArrowRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
