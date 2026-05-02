"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Star, Loader2, Crown, User } from "lucide-react";
import { ReturnToDashboard } from "@/components/Sidebar";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { CheerioImage } from "@/lib/imageVariants";
import { formatXP, calculateLevel } from "@/lib/xp";

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  level: number;
  count: number;
  photoURL?: string;
  photoBaseId?: string;
  email?: string;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myData, setMyData] = useState<LeaderboardUser | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  // Fetch all users ordered by XP
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("xp", "desc")
        );
        const snapshot = await getDocs(q);
        const list: LeaderboardUser[] = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          name: doc.data().name || doc.data().displayName || "Anonymous",
          xp: doc.data().xp || 0,
          level: calculateLevel(doc.data().xp || 0).level,
          count: doc.data().contributions || doc.data().count || 0,
          photoURL: doc.data().photoURL || doc.data().imageURL,
          photoBaseId: doc.data().photoBaseId,
          email: doc.data().email,
        }));
        setUsers(list);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Calculate own rank whenever users or currentUserId changes
  useEffect(() => {
    if (!currentUserId || users.length === 0) return;
    const idx = users.findIndex((u) => u.id === currentUserId);
    if (idx !== -1) {
      setMyRank(idx + 1);
      setMyData(users[idx]);
    }
  }, [users, currentUserId]);

  const top3 = users.slice(0, 3);

  // Build the 6-row visible list: top 5 + separator + my entry
  // If I'm already in top 5, still show top 5 + separator + me (without duplicate)
  const top5 = users.slice(0, 5);
  const isInTop5 = myRank !== null && myRank <= 5;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={16} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={16} className="text-slate-300" />;
    if (rank === 3) return <Medal size={16} className="text-amber-600" />;
    return <span className="text-xs font-bold text-brown-secondary/40">#{rank}</span>;
  };

  const Avatar = ({ user, size = 48 }: { user: LeaderboardUser; size?: number }) => (
    <div
      className="relative rounded-full overflow-hidden bg-gold-soft/20 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {user.photoURL || user.photoBaseId ? (
        <CheerioImage
          src={user.photoURL || ""}
          baseId={user.photoBaseId}
          variant="avatar"
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-bold text-brown-primary uppercase" style={{ fontSize: size / 2.5 }}>
          {user.name.charAt(0)}
        </span>
      )}
    </div>
  );

  if (!mounted || loading) {
    return (
      <main className="min-h-screen py-24 px-8">
        <ReturnToDashboard />
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
          <Loader2 className="w-16 h-16 text-gold-primary animate-spin" />
          <p className="text-brown-secondary font-bold uppercase tracking-widest text-xs animate-pulse">
            Summoning the Archives…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-24 px-8">
      <ReturnToDashboard />
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-soft/20 rounded-full text-brown-primary text-[10px] font-bold tracking-[0.3em] uppercase">
            <Trophy size={14} /> The Hall of Legacy
          </div>
          <h1 className="text-5xl font-bold text-brown-primary serif">Top Archivists.</h1>
          <p className="text-brown-secondary italic serif text-lg">
            Honoring those who have preserved the most frames of our story.
          </p>
          {users.length > 0 && (
            <p className="text-brown-secondary/40 text-xs font-bold uppercase tracking-widest">
              {users.length} Archivists Ranked
            </p>
          )}
        </div>


        {/* Podium / Top 3 */}
        {top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 items-end pt-4">

            {/* 2nd Place */}
            <div className="flex flex-col items-center space-y-3">
              <Avatar user={top3[1]} size={60} />
              <p className="text-[10px] font-bold text-brown-secondary uppercase tracking-widest text-center line-clamp-1">{top3[1].name}</p>
              <div className="h-28 w-full bg-gold-soft/10 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-brown-primary/10">
                <Medal size={20} className="text-slate-300 mb-1" />
                <span className="text-xs font-bold text-brown-secondary">{formatXP(top3[1].xp)} XP</span>
                <span className="text-[9px] text-brown-secondary/30 font-bold uppercase">2nd</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Crown size={20} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                </div>
                <div className="relative w-20 h-20 rounded-full border-4 border-gold-primary overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                  {top3[0]?.photoURL || top3[0]?.photoBaseId ? (
                    <CheerioImage 
                      src={top3[0].photoURL || ""} 
                      baseId={top3[0].photoBaseId}
                      variant="avatar"
                      alt={top3[0].name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brown-primary uppercase bg-gold-soft/20">
                      {top3[0].name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[10px] font-bold text-brown-primary uppercase tracking-widest text-center line-clamp-1">{top3[0].name}</p>
              <div className="h-44 w-full bg-gold-soft/30 rounded-t-3xl flex flex-col items-center justify-center border-t-4 border-gold-primary">
                <Trophy size={32} className="text-brown-primary mb-2" />
                <span className="text-sm font-bold text-brown-primary">{formatXP(top3[0].xp)} XP</span>
                <span className="text-[9px] text-brown-secondary/40 font-bold uppercase">1st</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center space-y-3">
              <Avatar user={top3[2]} size={60} />
              <p className="text-[10px] font-bold text-brown-secondary uppercase tracking-widest text-center line-clamp-1">{top3[2].name}</p>
              <div className="h-20 w-full bg-gold-soft/10 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-600/30">
                <Medal size={20} className="text-amber-600 mb-1" />
                <span className="text-xs font-bold text-brown-secondary">{formatXP(top3[2].xp)} XP</span>
                <span className="text-[9px] text-brown-secondary/30 font-bold uppercase">3rd</span>
              </div>
            </div>
          </div>
        )}

        {/* Compact 6-Row Leaderboard List */}
        {users.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-gold-primary/10 rounded-[2rem]">
            <p className="text-brown-secondary/30 font-bold uppercase tracking-widest text-sm italic serif">
              The archives are silent. No archivists yet.
            </p>
          </div>
        ) : (
          <div className="theme-card rounded-[2rem] overflow-hidden">
            {/* Top 5 rows */}
            {top5.map((user, i) => {
              const rank = i + 1;
              const isMe = user.id === currentUserId;
              return (
                <div
                  key={`rank-${user.id}-${rank}`}
                  className={`flex items-center gap-4 px-6 py-4 border-b border-brown-secondary/10 transition-colors ${
                    isMe
                      ? "bg-gold-primary/10 border-l-4 border-l-gold-primary"
                      : "hover:bg-gold-soft/5"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center shrink-0">
                    {getRankIcon(rank)}
                  </div>

                  {/* Avatar */}
                  <div className={`relative shrink-0 rounded-full overflow-hidden bg-gold-soft/20 flex items-center justify-center w-11 h-11 border ${
                    rank === 1 ? "border-gold-primary shadow-[0_0_12px_rgba(212,175,55,0.3)]" :
                    rank === 2 ? "border-slate-300" :
                    rank === 3 ? "border-amber-600" :
                    isMe ? "border-gold-primary/60" : "border-brown-secondary/10"
                  }`}>
                    {user.photoURL || user.photoBaseId ? (
                      <CheerioImage
                        src={user.photoURL || ""}
                        baseId={user.photoBaseId}
                        variant="avatar"
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-bold text-brown-primary uppercase">
                        {user.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Name + Level */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-brown-primary uppercase tracking-widest text-xs truncate">
                        {user.name}
                      </h3>
                      {isMe && (
                        <span className="shrink-0 text-[8px] font-bold text-gold-primary border border-gold-primary/40 rounded-full px-2 py-0.5 uppercase tracking-widest">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-brown-secondary/40 font-bold uppercase tracking-widest">
                      Lv. {user.level} · {user.count} Frames
                    </p>
                  </div>

                  {/* XP */}
                  <div className="text-right shrink-0">
                    <div className={`text-base font-bold tabular-nums serif ${
                      rank <= 3 ? "text-gold-primary" : isMe ? "text-gold-primary" : "text-brown-primary"
                    }`}>
                      {formatXP(user.xp)}
                    </div>
                    <div className="text-[9px] font-bold text-brown-secondary/30 uppercase tracking-widest">XP</div>
                  </div>
                </div>
              );
            })}

            {/* Separator row: "..." */}
            <div className="flex items-center justify-center gap-2 px-6 py-3 border-b border-brown-secondary/10 bg-transparent">
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-brown-secondary/20"></span>
                <span className="w-1 h-1 rounded-full bg-brown-secondary/20"></span>
                <span className="w-1 h-1 rounded-full bg-brown-secondary/20"></span>
              </div>
              {myRank && !isInTop5 && (
                <span className="text-[9px] font-bold text-brown-secondary/30 uppercase tracking-widest">
                  {myRank - 5} more above you
                </span>
              )}
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-brown-secondary/20"></span>
                <span className="w-1 h-1 rounded-full bg-brown-secondary/20"></span>
                <span className="w-1 h-1 rounded-full bg-brown-secondary/20"></span>
              </div>
            </div>

            {/* My rank row (6th row) — always shown, even if in top 5 */}
            {myData && myRank ? (
              <div className="flex items-center gap-4 px-6 py-4 bg-gold-primary/10 border-l-4 border-l-gold-primary">
                {/* Rank */}
                <div className="w-8 flex items-center justify-center shrink-0">
                  {getRankIcon(myRank)}
                </div>

                {/* Avatar */}
                <div className="relative shrink-0 rounded-full overflow-hidden bg-gold-soft/20 flex items-center justify-center w-11 h-11 border border-gold-primary/60">
                  {myData.photoURL || myData.photoBaseId ? (
                    <CheerioImage
                      src={myData.photoURL || ""}
                      baseId={myData.photoBaseId}
                      variant="avatar"
                      alt={myData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-bold text-brown-primary uppercase">
                      {myData.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-brown-primary uppercase tracking-widest text-xs truncate">
                      {myData.name}
                    </h3>
                    <span className="shrink-0 text-[8px] font-bold text-gold-primary border border-gold-primary/40 rounded-full px-2 py-0.5 uppercase tracking-widest">
                      You
                    </span>
                  </div>
                  <p className="text-[10px] text-brown-secondary/40 font-bold uppercase tracking-widest">
                    Lv. {myData.level} · {myData.count} Frames
                  </p>
                </div>

                {/* XP */}
                <div className="text-right shrink-0">
                  <div className="text-base font-bold tabular-nums serif text-gold-primary">
                    {formatXP(myData.xp)}
                  </div>
                  <div className="text-[9px] font-bold text-brown-secondary/30 uppercase tracking-widest">XP</div>
                </div>
              </div>
            ) : (
              /* Not logged in — show a placeholder 6th row */
              <div className="flex items-center justify-center gap-3 px-6 py-4 text-brown-secondary/30">
                <User size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sign in to see your rank</span>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
