"use client";

import { useState, useEffect, useCallback } from "react";
import { Video, Play, Download, Filter, UploadCloud, Film, X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ReturnToDashboard } from "@/components/Sidebar";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@/components/Pagination";

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
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

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

  // Pagination Logic
  const totalPages = Math.ceil(videos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVideos = videos.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = useCallback(() => {
    if (viewIndex !== null) {
      setViewIndex((viewIndex + 1) % videos.length);
    }
  }, [viewIndex, videos.length]);

  const handlePrev = useCallback(() => {
    if (viewIndex !== null) {
      setViewIndex((viewIndex - 1 + videos.length) % videos.length);
    }
  }, [viewIndex, videos.length]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && viewIndex !== null) {
      timeout = setTimeout(() => setShowControls(false), 2500);
    }
    return () => clearTimeout(timeout);
  }, [showControls, viewIndex]);

  const toggleControls = () => setShowControls(true);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      handlePrev();
    } else if (info.offset.x < -swipeThreshold) {
      handleNext();
    }
    toggleControls();
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setViewIndex(null);
      toggleControls();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewIndex, handleNext, handlePrev]);

  if (loading) return <div className="theme-cinematic min-h-screen flex items-center justify-center text-brown-primary serif text-2xl animate-pulse">Consulting the Reel...</div>;

  const currentVideo = viewIndex !== null ? videos[viewIndex] : null;

  return (
    <main className="min-h-screen py-24 px-8 relative">
      <ReturnToDashboard />
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <span className="text-gold-primary uppercase tracking-[0.4em] text-[10px] font-bold serif">The Archive</span>
            <h1 className="text-5xl font-bold text-brown-primary serif">Motion Legacy</h1>
            <p className="text-brown-secondary italic serif">Cinematic captures of our shared timeline.</p>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedVideos.map((video, index) => {
                const actualIndex = startIndex + index;
                return (
                  <div key={video.id} className="glass-card rounded-3xl border-gold/10 overflow-hidden group bg-gradient-to-br from-gold/5 to-transparent flex flex-col">
                    <div className="relative aspect-video cursor-pointer" onClick={() => setViewIndex(actualIndex)}>
                      <Image 
                        src={video.thumbnail || video.url.replace('.mp4', '.jpg')} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={`Thumbnail for ${video.title}`} 
                      />
                      <div className="absolute inset-0 bg-parchment-base/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                        <div className="w-16 h-16 rounded-full bg-gold-primary text-black flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                          <Play size={28} fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-card-tone/80 backdrop-blur-md text-black text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest">
                        {video.duration || "HD"}
                      </div>
                    </div>
                    <div className="p-6 flex items-center justify-between mt-auto">
                      <div>
                        <h3 className="font-bold serif text-brown-primary uppercase tracking-widest truncate max-w-[200px]">{video.title}</h3>
                        <p className="text-[10px] text-brown-secondary/40 font-bold uppercase tracking-widest mt-1">
                          {video.event || "Archival Reel"} | {video.uploadedBy || "Archivist"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewIndex(actualIndex)}
                          className="p-3 text-gold hover:bg-gold/10 rounded-full transition-colors"
                          title="Play Video"
                        >
                          <Maximize2 size={18} />
                        </button>
                        <a 
                          href={video.url} 
                          download 
                          target="_blank"
                          className="p-3 text-gold hover:bg-gold/10 rounded-full transition-colors"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center text-gold/40 border border-gold/5">
              <Film size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold serif text-brown-primary uppercase tracking-tighter">The Reels are Silent</h2>
              <p className="text-brown-secondary/40 italic serif max-w-md mx-auto">No cinematic memories have been recorded yet. Lead the production of the 2026 legacy.</p>
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

      {/* Google Drive Style Immersive Video Player Overlay */}
      <AnimatePresence>
        {currentVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-parchment-base/98"
            onClick={toggleControls}
          >
            {/* Header - Auto Hiding */}
            <AnimatePresence>
              {showControls && (
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="absolute top-0 inset-x-0 z-[120] flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gold-primary/20 rounded-lg text-gold-primary">
                      <Film size={16} />
                    </div>
                    <div>
                      <h2 className="text-brown-primary font-bold serif tracking-widest uppercase text-sm">{currentVideo.title}</h2>
                      <p className="text-brown-secondary/40 text-[9px] font-bold uppercase tracking-widest">Reel {viewIndex! + 1} of {videos.length} | {currentVideo.event || "Archive"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <a 
                      href={currentVideo.url} 
                      download
                      className="p-2 text-brown-secondary/60 hover:text-brown-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={20} />
                    </a>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewIndex(null); }}
                      className="p-2 text-brown-secondary/60 hover:text-brown-primary bg-card-tone rounded-full transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Video Area */}
            <div className="flex-grow flex items-center justify-center relative overflow-hidden">
              {/* Previous Button - Extreme Edge & Tiny */}
              <AnimatePresence>
                {showControls && (
                  <motion.button 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-4 z-[110] p-2 text-black transition-all bg-white/90 hover:bg-white shadow-xl rounded-full"
                    aria-label="Previous video"
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Swipeable Video Container */}
              <motion.div 
                key={currentVideo.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                <video 
                  src={currentVideo.url}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={currentVideo.thumbnail || currentVideo.url.replace('.mp4', '.jpg')}
                />
              </motion.div>

              {/* Next Button - Extreme Edge & Tiny */}
              <AnimatePresence>
                {showControls && (
                  <motion.button 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-4 z-[110] p-2 text-black transition-all bg-white/90 hover:bg-white shadow-xl rounded-full"
                    aria-label="Next video"
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Footer - Auto Hiding */}
            <AnimatePresence>
              {showControls && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="absolute bottom-0 inset-x-0 p-8 text-center bg-gradient-to-t from-black/80 to-transparent"
                >
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-brown-secondary/30 text-[9px] font-bold uppercase tracking-[0.5em]">Cheerio Archive Protocol v2.0</p>
                    <p className="text-gold-primary/40 text-[7px] font-bold uppercase tracking-widest italic">Captured by {currentVideo.uploadedBy || "Archivist"}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
