"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { TrendingUp, Megaphone, Calendar, Zap, Image as ImageIcon, Play, Music, Film, Layers } from "lucide-react";
import { ReturnToDashboard } from "@/components/Sidebar";

interface MediaAsset {
  url: string;
  type: 'image' | 'video' | 'audio';
}

interface HypeItem {
  id: string;
  title: string;
  content: string;
  date: string;
  tag: string;
  mediaGallery?: MediaAsset[];
  mediaURL?: string;
  mediaType?: 'image' | 'video' | 'audio';
  createdAt: any;
}

export default function HypePage() {
  const [items, setItems] = useState<HypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHype = async () => {
      try {
        const q = query(collection(db, "hype_board"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as HypeItem));
        setItems(data);
      } catch (err) {
        console.error("Fetch Hype Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHype();
  }, []);

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8">
      <ReturnToDashboard />
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-8 border-b border-gold/20 pb-12">
          <div className="space-y-2">
            <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold serif">Cheerio Pulse</span>
            <h1 className="text-5xl font-bold text-ink dark:text-gold serif">The Hype Board.</h1>
            <p className="text-ink/60 dark:text-dark-text/60 italic serif text-lg">Every update, every milestone, every cheer.</p>
          </div>
          <div className="w-20 h-20 bg-gold text-ink rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
            <Megaphone size={32} />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-16">
          {loading ? (
            <div className="py-20 text-center text-ink/40 dark:text-gold/40 italic serif text-xl animate-pulse">
              Consulting the archives for the latest pulse...
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-ink/40 dark:text-gold/40 italic serif text-xl border-2 border-dashed border-gold/10 rounded-3xl">
              The vault is silent... for now.
            </div>
          ) : (
            items.map((item, i) => (
              <div key={item.id} className="relative pl-12 group animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                {/* Timeline Line */}
                {i !== items.length - 1 && (
                  <div className="absolute left-[23px] top-8 bottom-[-64px] w-0.5 bg-gold/10" />
                )}
                
                {/* Timeline Dot */}
                <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-gold/5 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-ink transition-all duration-500 shadow-xl">
                  <Zap size={20} />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] bg-gold/5 px-3 py-1 rounded-full border border-gold/10">{item.tag}</span>
                    <div className="flex items-center gap-2 text-ink/40 dark:text-dark-text/40 text-[10px] font-bold uppercase">
                      <Calendar size={12} />
                      {item.date}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-ink dark:text-gold serif leading-tight">{item.title}</h2>
                    <p className="text-ink/70 dark:text-dark-text/70 leading-relaxed serif italic text-xl max-w-2xl">
                      "{item.content}"
                    </p>
                  </div>

                  {/* Multimedia Gallery Rendering */}
                  {(item.mediaGallery && item.mediaGallery.length > 0) ? (
                    <div className={`grid gap-4 max-w-2xl ${item.mediaGallery.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {item.mediaGallery.map((asset, idx) => (
                        <div key={idx} className={`rounded-3xl overflow-hidden border border-gold/20 shadow-2xl bg-black/5 ${item.mediaGallery!.length > 1 && idx === 0 && item.mediaGallery!.length % 2 !== 0 ? 'col-span-2' : ''}`}>
                          {asset.type === 'image' && (
                            <img src={asset.url} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                          )}
                          {asset.type === 'video' && (
                            <video src={asset.url} controls className="w-full h-full" />
                          )}
                          {asset.type === 'audio' && (
                            <div className="p-8 flex flex-col items-center gap-4 bg-gold/5 h-full justify-center">
                              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                <Music size={24} />
                              </div>
                              <audio src={asset.url} controls className="w-full" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : item.mediaURL ? (
                    <div className="rounded-3xl overflow-hidden border border-gold/20 shadow-2xl max-w-2xl bg-black/5">
                      {item.mediaType === 'image' && (
                        <img src={item.mediaURL} alt={item.title} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-1000" />
                      )}
                      {item.mediaType === 'video' && (
                        <video src={item.mediaURL} controls className="w-full h-auto" />
                      )}
                      {item.mediaType === 'audio' && (
                        <div className="p-8 flex flex-col items-center gap-6 bg-gold/5">
                          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                            <Music size={32} />
                          </div>
                          <audio src={item.mediaURL} controls className="w-full" />
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="pt-4 flex gap-6">
                    <button className="text-[10px] font-bold uppercase tracking-widest text-gold hover:underline flex items-center gap-2">
                      <Zap size={14} /> Boost
                    </button>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-gold hover:underline">Share Update</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
