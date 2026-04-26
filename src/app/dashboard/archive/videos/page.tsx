"use client";

import { useState, useEffect } from "react";
import { Video, Play, Download, Filter, UploadCloud, Film } from "lucide-react";
import Link from "next/link";
import { ReturnToDashboard } from "@/components/Sidebar";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import Image from "next/image";

interface ArchiveVideo {
  id: string;
  url: string;
  thumbnail?: string;
  title: string;
  event?: string;
  duration?: string;
  uploadedBy?: string;
  createdAt?: string | number | Date;
}

export default function VideoArchive() {
  const [videos, setVideos] = useState<ArchiveVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "archives"), 
      where("type", "==", "video"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArchiveVideo));
      setVideos(docs);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="theme-cinematic min-h-screen flex items-center justify-center text-brown-primary serif text-2xl animate-pulse">Consulting the Reel...</div>;

  return (
    <main className="min-h-screen py-24 px-8">
      <ReturnToDashboard />
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold serif">The Archive</span>
            <h1 className="text-5xl font-bold text-ink dark:text-gold serif">Motion Legacy</h1>
            <p className="text-ink/60 dark:text-dark-text/60 italic serif">Cinematic captures of our shared timeline.</p>
          </div>
          
          <Link 
            href="/dashboard/upload/video"
            className="gold-button px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-xl transition-all hover:scale-105"
          >
            <UploadCloud size={16} />
            Add New Reel (+25 XP)
          </Link>
        </div>

        {/* Video Grid or Empty State */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div key={video.id} className="glass-card rounded-3xl border-gold/10 overflow-hidden group bg-gradient-to-br from-gold/5 to-transparent">
                <div className="relative aspect-video">
                  <Image 
                    src={video.thumbnail || video.url.replace('.mp4', '.jpg')} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover" 
                    alt={video.title} 
                  />
                  <div className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={video.url}
                      target="_blank"
                      className="w-16 h-16 rounded-full bg-gold text-ink flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform"
                    >
                      <Play size={28} fill="currentColor" />
                    </Link>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-ink/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest">
                    {video.duration || "HD"}
                  </div>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold serif text-ink dark:text-gold uppercase tracking-widest truncate max-w-[200px]">{video.title}</h3>
                    <p className="text-[10px] text-ink/40 dark:text-dark-text/40 font-bold uppercase tracking-widest mt-1">
                      {video.event || "Archival Reel"} | {video.uploadedBy || "Archivist"}
                    </p>
                  </div>
                  <button className="p-3 text-gold hover:bg-gold/10 rounded-full transition-colors">
                    <Download size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center text-gold/40 border border-gold/5">
              <Film size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold serif text-ink dark:text-gold uppercase tracking-tighter">The Reels are Silent</h2>
              <p className="text-ink/40 dark:text-dark-text/40 italic serif max-w-md mx-auto">No cinematic memories have been recorded yet. Lead the production of the 2026 legacy.</p>
            </div>
            <Link 
              href="/dashboard/upload/video"
              className="gold-button px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest shadow-2xl transition-all hover:scale-105"
            >
              <UploadCloud size={20} />
              Drop the First Reel (+25 XP)
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
