"use client";

import { useState, useEffect } from "react";
import { Download, Filter, Search, CheckCircle2, Circle, Grid, List, PlusCircle } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ReturnToDashboard } from "@/components/Sidebar";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function ImageArchive() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for the archives collection
    // We filter by type='image' and order by creation date
    const q = query(
      collection(db, "archives"), 
      where("type", "==", "image"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(docs);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const downloadAsZip = async () => {
    if (selected.length === 0) return;
    setDownloading(true);
    const zip = new JSZip();
    const folder = zip.folder("Cheerio-2026-Memories");

    try {
      for (let i = 0; i < selected.length; i++) {
        const photo = photos.find(p => p.id === selected[i]);
        if (!photo) continue;
        const response = await fetch(photo.url);
        const blob = await response.blob();
        // Use the metadata for naming if available
        const filename = `${photo.event || 'memory'}-${photo.id}.jpg`;
        folder?.file(filename, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "Cheerio-2026-Memories.zip");
    } catch (err) {
      console.error(err);
      alert("Failed to create archive. Some images might be restricted.");
    } finally {
      setDownloading(false);
      setSelected([]);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-parchment dark:bg-dark-bg text-gold serif text-2xl animate-pulse">Opening the Vault...</div>;

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8">
      <ReturnToDashboard />
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold serif">The Archive</span>
            <h1 className="text-5xl font-bold text-ink dark:text-gold serif">Image Legacy</h1>
            <p className="text-ink/60 dark:text-dark-text/60 italic serif">Preserving every frame of our story.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {selected.length > 0 && (
              <button 
                onClick={downloadAsZip}
                disabled={downloading}
                className="gold-button px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-xl animate-in fade-in slide-in-from-right-4"
              >
                <Download size={16} />
                {downloading ? "Archiving..." : `Download Zip (${selected.length})`}
              </button>
            )}
            <button className="p-3 bg-ink/5 dark:bg-white/5 border border-gold/10 rounded-full text-gold">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Gallery Grid or Empty State */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div 
                key={photo.id}
                onClick={() => toggleSelect(photo.id)}
                className="relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer group border border-gold/10 hover:border-gold/40 transition-all"
              >
                <img 
                  src={photo.url} 
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    selected.includes(photo.id) ? "scale-95" : "group-hover:scale-110"
                  }`}
                  alt="Memory"
                />
                
                {/* Overlay */}
                <div className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${
                  selected.includes(photo.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`} />

                {/* Selection Icon */}
                <div className="absolute top-4 right-4">
                  {selected.includes(photo.id) ? (
                    <CheckCircle2 className="text-gold" size={28} />
                  ) : (
                    <Circle className="text-white/40" size={28} />
                  )}
                </div>

                {/* Tag/Metadata - Can show Folder or Event */}
                <div className="absolute bottom-4 left-4">
                  <span className="text-[8px] font-bold text-gold bg-ink/60 backdrop-blur-md px-2 py-1 rounded uppercase tracking-widest">
                    {photo.event || "General"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center text-gold/40 border border-gold/5">
              <Grid size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold serif text-ink dark:text-gold uppercase tracking-tighter">The Vault is Silent</h2>
              <p className="text-ink/40 dark:text-dark-text/40 italic serif max-w-md mx-auto">No memories have been recorded yet. Be the first to add a frame to the 2026 legacy.</p>
            </div>
            <Link 
              href="/dashboard/upload/image"
              className="gold-button px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest shadow-2xl transition-all hover:scale-105"
            >
              <PlusCircle size={20} />
              Begin the Archive (+25 XP)
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
