"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ReturnToDashboard } from "@/components/Sidebar";
import { Download, Sparkles, Image as ImageIcon, Archive, Share2, CheckCircle, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function MyMoments() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const memoriesRef = collection(db, "users", user.uid, "found_memories");
        const q = query(memoriesRef, orderBy("detectedAt", "desc"));
        
        const unsubMemories = onSnapshot(q, (snap) => {
          setMemories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });

        return () => unsubMemories();
      }
    });
    return () => unsubscribe();
  }, []);

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
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      <p className="text-gold font-bold uppercase tracking-[0.3em] text-xs animate-pulse">Accessing Your Personal Vault...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8">
      <ReturnToDashboard />
      
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full text-gold text-[10px] font-bold tracking-[0.3em] uppercase">
              <Sparkles size={14} /> Neural Personal Archive
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-ink dark:text-gold serif">Verified Moments.</h1>
            <p className="text-ink/60 dark:text-dark-text/60 italic serif text-xl">Every frame the AI engine has reclaimed for you.</p>
          </div>

          {memories.length > 0 && (
            <button 
              onClick={downloadAll}
              disabled={downloadingAll}
              className="gold-button flex items-center gap-3 px-8 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-2xl disabled:opacity-50"
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
        </div>

        {/* Empty State */}
        {memories.length === 0 ? (
          <div className="glass-card p-24 rounded-[3rem] border-gold/10 text-center space-y-8">
            <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center text-gold/20 mx-auto">
              <ImageIcon size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-ink dark:text-gold serif">No moments detected yet.</h3>
              <p className="text-ink/60 dark:text-dark-text/60 italic serif max-w-md mx-auto">
                The global AI scan hasn't linked any frames to your biometric signature yet. 
                Keep contributing to the archive!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {memories.map((m, i) => (
              <div 
                key={m.id} 
                className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-gold/20 shadow-2xl bg-black/40 animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <img src={m.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Moment" />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Reclaimed Moment</p>
                        <p className="text-xs text-white/60 italic serif">{new Date(m.detectedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-gold/20 p-2 rounded-full text-gold">
                        <CheckCircle size={14} />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => downloadSingle(m.url, m.id)}
                        className="flex-1 bg-gold text-ink py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors"
                      >
                        <Download size={14} /> Download
                      </button>
                      <button className="p-3 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-colors">
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Initial Badge */}
                <div className="absolute top-6 right-6 px-3 py-1 bg-gold/80 backdrop-blur-md rounded-full text-[8px] font-bold text-ink uppercase tracking-widest group-hover:opacity-0 transition-opacity">
                  Verified
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {memories.length > 0 && (
          <div className="text-center py-12">
            <p className="text-[10px] font-bold text-gold/40 uppercase tracking-[0.5em]">
              Archive synchronized with {memories.length} biometric matches
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
