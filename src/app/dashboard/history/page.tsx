"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { Trophy, Vote, Gamepad2, ArrowLeft, History } from "lucide-react";
import Link from "next/link";

export default function EngagementHistoryPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const q = query(
        collection(db, "engagement_modules"), 
        where("status", "in", ["results", "completed"]),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setModules(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen bg-parchment p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="p-3 bg-gold-soft/20 rounded-full text-brown-primary hover:bg-gold-soft/40 transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex flex-col items-end text-right">
            <div className="flex items-center gap-3 text-gold-primary mb-1">
              <History size={20} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">The Chronicles</span>
            </div>
            <h1 className="text-4xl font-bold serif text-brown-primary italic uppercase tracking-tighter">Engagement History</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-gold-soft border-t-gold-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6">
            {modules.map((module) => (
              <div key={module.id} className="theme-card p-8 rounded-[2.5rem] border border-gold-soft/30 hover:border-gold-primary/50 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className={`p-5 rounded-3xl ${
                      module.type === 'poll' ? "bg-blue-500/10 text-blue-500" : 
                      "bg-purple-500/10 text-purple-500"
                    }`}>
                      {module.type === 'poll' ? <Vote size={28} /> : <Gamepad2 size={28} />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold serif text-brown-primary italic">{module.title}</h3>
                      <p className="text-brown-secondary text-sm italic serif mt-1">{module.description}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full">
                          {new Date(module.createdAt?.seconds * 1000).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-bold text-gold-primary uppercase tracking-widest bg-gold-soft/10 px-3 py-1 rounded-full border border-gold-soft/30">
                          {module.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gold-soft/5 rounded-3xl p-6 border border-gold-soft/20 md:w-64">
                    <h4 className="text-[10px] font-bold text-brown-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <Trophy size={12} /> Final Outcome
                    </h4>
                    {module.type === 'poll' ? (
                      <div className="space-y-3">
                         {Object.entries(module.config.votes || {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 2).map(([opt, count]: any) => (
                           <div key={opt} className="flex justify-between items-center">
                              <span className="text-xs font-bold text-brown-secondary uppercase truncate pr-4">{opt}</span>
                              <span className="text-sm font-black text-brown-primary tabular-nums">{count}</span>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="text-center">
                         <p className="text-xs font-bold text-brown-secondary uppercase italic">Results archived</p>
                         <p className="text-[10px] text-zinc-400 mt-1">See notifications for details</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {modules.length === 0 && (
              <div className="text-center py-20 bg-gold-soft/5 rounded-[3rem] border border-dashed border-gold-soft/50">
                 <p className="text-brown-secondary italic serif">The scrolls are currently empty.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
