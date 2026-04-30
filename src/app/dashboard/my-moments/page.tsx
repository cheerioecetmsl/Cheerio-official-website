"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ReturnToDashboard } from "@/components/Sidebar";
import { Download, Sparkles, Image as ImageIcon, Archive, Share2, CheckCircle, Loader2, Zap } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Image from "next/image";
import { PulseOverlay } from "@/components/PulseOverlay";
import { runPulseScan } from "@/lib/pulse";
import { IdentityGate } from "@/components/IdentityGate";

import { Pagination } from "@/components/Pagination";

interface FoundMemory {
  id: string;
  url: string;
  detectedAt: string;
  metadata?: Record<string, unknown>;
}

export default function MyMoments() {
  const [memories, setMemories] = useState<FoundMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [isPulseOpen, setIsPulseOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const memoriesRef = collection(db, "users", user.uid, "found_memories");
        const q = query(memoriesRef, orderBy("detectedAt", "desc"));
        
        const unsubMemories = onSnapshot(q, (snap) => {
          setMemories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoundMemory)));
          setLoading(false);
        });

        return () => unsubMemories();
      }
    });
    return () => unsubscribe();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(memories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMemories = memories.slice(startIndex, startIndex + itemsPerPage);

  const downloadSingle = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, `Moment-${id.slice(0, 8)}.jpg`);
    } catch (err) {
      console.error(err);
      alert("Download failed. The memory could not be retrieved.");
    }
  };

  const downloadAll = async () => {
    if (memories.length === 0) return;
    setDownloadingAll(true);
    const zip = new JSZip();
    const folder = zip.folder("My-Cheerio-Moments");

    try {
      const promises = memories.map(async (m, i) => {
        const response = await fetch(m.url);
        const blob = await response.blob();
        folder?.file(`Moment-${i + 1}.jpg`, blob);
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "My-Cheerio-Archive.zip");
    } catch (err) {
      console.error(err);
      alert("Failed to package archive. Some memories might be inaccessible.");
    } finally {
      setDownloadingAll(false);
    }
  };


  if (loading) return (
    <div className="theme-cinematic min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-brown-primary font-bold uppercase tracking-[0.3em] text-xs animate-pulse">Accessing Your Personal Vault...</p>
    </div>
  );

  return (
    <IdentityGate>
      <main className="min-h-screen py-24 px-8 relative">
        <ReturnToDashboard />
        
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-soft/20 rounded-full text-gold-primary text-[10px] font-bold tracking-[0.3em] uppercase">
                <Sparkles size={14} /> Neural Personal Archive
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-brown-primary serif">Verified Moments.</h1>
              <p className="text-brown-secondary italic serif text-xl">Every frame the AI engine has reclaimed for you.</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {memories.length > 0 && (
                <button 
                  onClick={downloadAll}
                  disabled={downloadingAll}
                  className="theme-cinematic-btn-primary flex items-center gap-3 px-8 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  {downloadingAll ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Packaging Archive...
                    </>
                  ) : (
                    <>
                      <Archive size={20} />
                      Download Full Batch (.zip)
                    </>
                  )}
                </button>
              )}
              <button 
                onClick={() => setIsPulseOpen(true)}
                className="bg-card-tone border border-gold-soft/30 hover:border-gold-primary text-brown-primary flex items-center gap-3 px-8 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-2xl transition-all"
              >
                <Zap size={20} className="fill-gold-primary" />
                Initialize Pulse
              </button>
            </div>
          </div>
        
          <PulseOverlay 
            isOpen={isPulseOpen}
            onClose={() => setIsPulseOpen(false)}
          />

          {/* Empty State */}
          {memories.length === 0 ? (
            <div className="theme-card p-24 rounded-[3rem] text-center space-y-8">
              <div className="w-24 h-24 bg-card-tone rounded-full flex items-center justify-center text-gold-soft mx-auto">
                <ImageIcon size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-brown-primary serif">No moments detected yet.</h3>
                <p className="text-brown-secondary italic serif max-w-md mx-auto">
                  The global AI scan hasn&apos;t linked any frames to your biometric signature yet. 
                  Keep contributing to the archive!
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {paginatedMemories.map((m, i) => (
                  <div 
                    key={m.id} 
                    className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-gold-soft/40 shadow-2xl bg-card-tone animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <Image 
                      src={m.url} 
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                      alt="Moment" 
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-parchment-base/95 via-parchment-base/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-brown-primary uppercase tracking-widest">Reclaimed Moment</p>
                            <p className="text-xs text-brown-secondary/60 italic serif">{new Date(m.detectedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="bg-gold-soft/20 p-2 rounded-full text-brown-primary">
                            <CheckCircle size={14} />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => downloadSingle(m.url, m.id)}
                            className="flex-1 bg-gold-primary text-black py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors"
                          >
                            <Download size={14} /> Download
                          </button>
                          <button className="p-3 border border-brown-primary/20 rounded-xl text-brown-primary hover:bg-gold-soft/10 transition-colors">
                            <Share2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Initial Badge */}
                    <div className="absolute top-6 right-6 px-3 py-1 bg-gold-soft/80 backdrop-blur-md rounded-full text-[8px] font-bold text-black uppercase tracking-widest group-hover:opacity-0 transition-opacity">
                      Verified
                    </div>
                  </div>
                ))}
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
          )}

          {/* Stats Footer */}
          {memories.length > 0 && (
            <div className="text-center py-12">
              <p className="text-[10px] font-bold text-brown-secondary/60 uppercase tracking-[0.5em]">
                Archive synchronized with {memories.length} biometric matches
              </p>
            </div>
          )}
        </div>
      </main>
    </IdentityGate>
  );
}
