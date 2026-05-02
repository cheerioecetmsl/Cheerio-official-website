"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Filter, Search, CheckCircle2, Circle, Grid, List, PlusCircle, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ReturnToDashboard } from "@/components/Sidebar";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";
// Removed next/image for static asset delivery
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@/components/Pagination";
import { getRawCloudinaryUrl } from "@/lib/cloudinary";
import { CheerioImage, getDownloadUrl } from "@/lib/imageVariants";

interface ArchivePhoto {
  id: string;
  url: string;
  baseId?: string;
  event?: string;
  createdAt?: string | number | Date;
  uploadedBy?: string;
}

export default function ImageArchive() {
  const [photos, setPhotos] = useState<ArchivePhoto[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const q = query(
          collection(db, "archives"), 
          where("type", "==", "image"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArchivePhoto));
        setPhotos(docs);
      } catch (err) {
        console.error("Firestore Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(photos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPhotos = photos.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = useCallback(() => {
    if (viewIndex !== null) {
      setViewIndex((viewIndex + 1) % photos.length);
    }
  }, [viewIndex, photos.length]);

  const handlePrev = useCallback(() => {
    if (viewIndex !== null) {
      setViewIndex((viewIndex - 1 + photos.length) % photos.length);
    }
  }, [viewIndex, photos.length]);

  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && viewIndex !== null) {
      timeout = setTimeout(() => setShowControls(false), 2000); // 2 seconds feels more natural than 1
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

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const downloadAsZip = async () => {
    if (selected.length === 0) return;
    setDownloadingAll(true);
    const zip = new JSZip();
    const folder = zip.folder("Cheerio-2026-Memories");

    try {
      for (let i = 0; i < selected.length; i++) {
        const photo = photos.find(p => p.id === selected[i]);
        if (!photo) continue;
        
        // Use high-res gallery JPG if baseId exists, otherwise fallback to url
        const downloadUrl = photo.baseId 
          ? getDownloadUrl(photo.baseId, "gallery")
          : photo.url;
          
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const filename = `${photo.event || 'memory'}-${photo.id}.jpg`;
        folder?.file(filename, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "Cheerio-2026-Memories.zip");
    } catch (err) {
      console.error(err);
      alert("Failed to create archive. Some images might be restricted.");
    } finally {
      setDownloadingAll(false);
      setSelected([]);
    }
  };

  if (loading) return <div className="theme-cinematic min-h-screen flex items-center justify-center text-brown-primary serif text-2xl animate-pulse">Opening the Vault...</div>;

  const currentPhoto = viewIndex !== null ? photos[viewIndex] : null;

  return (
    <main className="min-h-screen py-24 px-8 relative">
      <ReturnToDashboard />
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <span className="text-brown-secondary uppercase tracking-[0.4em] text-[10px] font-bold serif">The Archive</span>
            <h1 className="text-5xl font-bold text-brown-primary serif">Image Legacy</h1>
            <p className="text-brown-secondary italic serif">Preserving every frame of our story.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {selected.length > 0 && (
              <button 
                onClick={downloadAsZip}
                disabled={downloadingAll}
                className="theme-cinematic-btn-primary px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-right-4"
              >
                <Download size={16} />
                {downloadingAll ? "Archiving..." : `Download Zip (${selected.length})`}
              </button>
            )}
            <Link 
              href="/dashboard/upload/image"
              className="p-3 bg-card-tone border border-gold-soft/30 rounded-full text-gold-primary hover:scale-110 transition-transform"
              title="Upload New Memory"
            >
              <PlusCircle size={20} />
            </Link>
          </div>
        </div>

        {/* Gallery Grid or Empty State */}
        {photos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedPhotos.map((photo, index) => {
                const actualIndex = startIndex + index;
                return (
                  <div 
                    key={photo.id}
                    onClick={() => setViewIndex(actualIndex)}
                    className="relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer group border border-gold/10 hover:border-gold/40 transition-all bg-card-tone"
                  >
                    <CheerioImage 
                      baseId={photo.baseId}
                      fallbackUrl={photo.url}
                      variant="card"
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        selected.includes(photo.id) ? "scale-95" : "group-hover:scale-110"
                      }`}
                      alt={photo.event || "Memory"}
                    />
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-parchment-base/40 transition-opacity duration-300 ${
                      selected.includes(photo.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    } flex items-center justify-center`}>
                      <Maximize2 size={32} className="text-gold-primary/60 opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100" />
                    </div>

                    {/* Selection Icon */}
                    <div 
                      className="absolute top-4 right-4 z-10 p-1"
                      onClick={(e) => toggleSelect(photo.id, e)}
                    >
                      {selected.includes(photo.id) ? (
                        <CheckCircle2 className="text-gold-primary" size={28} />
                      ) : (
                        <Circle className="text-gold-primary/40 hover:text-gold-primary transition-colors" size={28} />
                      )}
                    </div>

                    {/* Tag/Metadata */}
                    <div className="absolute bottom-4 left-4">
                      <span className="text-[8px] font-bold text-black bg-card-tone/80 backdrop-blur-md px-2 py-1 rounded uppercase tracking-widest">
                        {photo.event || "General"}
                      </span>
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
            <div className="w-24 h-24 rounded-full bg-card-tone flex items-center justify-center text-gold-soft border border-gold-soft/30">
              <Grid size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold serif text-brown-primary uppercase tracking-tighter">The Vault is Silent</h2>
              <p className="text-brown-secondary italic serif max-w-md mx-auto">No memories have been recorded yet. Be the first to add a frame to the 2026 legacy.</p>
            </div>
            <Link 
              href="/dashboard/upload/image"
              className="theme-cinematic-btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
            >
              <PlusCircle size={20} />
              Begin the Archive (+25 XP)
            </Link>
          </div>
        )}
      </div>

      {/* Cinematic Image Viewer Overlay */}
      <AnimatePresence>
        {currentPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-parchment-base/98 cursor-none"
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
                      <Maximize2 size={16} />
                    </div>
                    <div>
                      <h2 className="text-brown-primary font-bold serif tracking-widest uppercase text-sm">{currentPhoto.event || "Archive Memory"}</h2>
                      <p className="text-brown-secondary/40 text-[9px] font-bold uppercase tracking-widest">Frame {viewIndex! + 1} of {photos.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={getRawCloudinaryUrl(currentPhoto.url)} 
                      download
                      className="p-2 text-brown-secondary/60 hover:text-brown-primary transition-colors"
                    >
                      <Download size={18} />
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

            {/* Main Viewer Area */}
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
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Swipeable Image Container */}
              <div className="relative w-full max-w-[98vw] h-screen flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentPhoto.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                  >
                    <CheerioImage 
                      baseId={currentPhoto.baseId}
                      fallbackUrl={currentPhoto.url}
                      variant="preview"
                      className="w-full h-full object-contain pointer-events-none"
                      alt={currentPhoto.event || "Large View"}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Button - Extreme Edge & Tiny */}
              <AnimatePresence>
                {showControls && (
                  <motion.button 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-4 z-[110] p-2 text-black transition-all bg-white/90 hover:bg-white shadow-xl rounded-full"
                    aria-label="Next image"
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
                    <p className="text-gold-primary/40 text-[7px] font-bold uppercase tracking-widest italic">Archived by {currentPhoto.uploadedBy || "Unknown"}</p>
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
