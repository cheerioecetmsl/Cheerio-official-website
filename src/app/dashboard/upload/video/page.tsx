"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, increment, collection, addDoc } from "firebase/firestore";
import { Video as VideoIcon, Upload, CheckCircle, ArrowLeft, X, Loader2 } from "lucide-react";
import { Film } from "lucide-react";
import Link from "next/link";
import { ReturnToDashboard } from "@/components/Sidebar";

export default function VideoUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map(f => URL.createObjectURL(f));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadBatch = async () => {
    if (files.length === 0 || !auth.currentUser) return;
    setUploading(true);
    setUploadedCount(0);

    try {
      const uploadPromises = files.map(async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "Cheerio-2026");
        data.append("folder", "Cheerio/videos");

        const res = await fetch(`https://api.cloudinary.com/v1_1/dyvobdjp5/video/upload`, {
          method: "POST",
          body: data
        });
        const resData = await res.json();

        await addDoc(collection(db, "archive"), {
          url: resData.secure_url,
          type: "video",
          userId: auth.currentUser!.uid,
          userName: auth.currentUser!.displayName,
          createdAt: new Date().toISOString(),
          tag: "General"
        });

        setUploadedCount(prev => prev + 1);
        return resData.secure_url;
      });

      await Promise.all(uploadPromises);

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        xp: increment(25 * files.length)
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Batch video upload failed. Some cinematic memories may not have been preserved.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        
        <ReturnToDashboard />

        <div className="glass-card p-12 rounded-[3rem] border-gold/20 text-center space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full text-gold text-[9px] font-bold tracking-widest uppercase">
              <VideoIcon size={12} /> Motion Archival
            </div>
            <h1 className="text-4xl font-bold text-ink dark:text-gold serif">Archive Reels.</h1>
            <p className="text-ink/60 dark:text-dark-text/60 italic serif">Upload motion memories to earn +25 Legacy XP per reel.</p>
          </div>

          {!success ? (
            <div className="space-y-8">
              <div className={`relative min-h-[300px] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden ${
                previews.length > 0 ? "border-gold/40 p-6" : "border-gold/10 hover:border-gold/20 p-12"
              }`}>
                {previews.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group border border-gold/10 bg-black">
                        <video src={src} className="w-full h-full object-cover" controls />
                        <button 
                          onClick={(e) => { e.preventDefault(); removeFile(idx); }}
                          className="absolute top-2 right-2 p-1.5 bg-red-900/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <Film size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                    <label className="relative aspect-video rounded-2xl border-2 border-dashed border-gold/20 flex flex-col items-center justify-center cursor-pointer hover:bg-gold/5 transition-all text-gold/40">
                      <VideoIcon size={24} />
                      <span className="text-[8px] font-bold uppercase mt-2">Add More Reels</span>
                      <input type="file" onChange={handleFiles} multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="video/*" />
                    </label>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gold/5 rounded-full flex items-center justify-center text-gold/40 mx-auto">
                      <Upload size={32} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gold/40">Choose video reels to archive</p>
                    <input type="file" onChange={handleFiles} multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="video/*" />
                  </div>
                )}
              </div>

              <button 
                onClick={uploadBatch}
                disabled={files.length === 0 || uploading}
                className="gold-button w-full py-5 rounded-2xl font-bold uppercase tracking-[0.3em] shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <Film size={20} className="animate-spin" />
                    Locking {uploadedCount}/{files.length} Reels...
                  </>
                ) : (
                  `Archive ${files.length > 0 ? files.length : ""} Reels`
                )}
              </button>
            </div>
          ) : (
            <div className="py-12 space-y-8 animate-in zoom-in duration-700">
              <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                <CheckCircle size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-ink dark:text-gold serif">Motion Preserved.</h3>
                <p className="text-gold font-bold uppercase tracking-widest text-sm">+{25 * files.length} XP Awarded</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setSuccess(false); setPreviews([]); setFiles([]); setUploadedCount(0); }} className="flex-1 py-4 border border-gold/20 rounded-xl text-xs font-bold uppercase tracking-widest text-gold">Add More</button>
                <Link href="/dashboard" className="flex-1 py-4 bg-gold text-ink rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl">Go to Dashboard</Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
