"use client";

import { useState, useRef, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, increment, collection, addDoc } from "firebase/firestore";
import {
  Image as ImageIcon, Upload, CheckCircle, X, Loader2,
  Camera, SwitchCamera, AlertCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ReturnToDashboard } from "@/components/Sidebar";

export default function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── File helpers ─────────────────────────────────────────
  const addFiles = (newFiles: File[]) => {
    const imgs = newFiles.filter(f => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setFiles(p => [...p, ...imgs]);
    setPreviews(p => [...p, ...imgs.map(f => URL.createObjectURL(f))]);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const removeFile = (i: number) => {
    setFiles(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  // ── Drag & drop ─────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  // ── Live camera (desktop / browser) ─────────────────────
  // getUserMedia is what causes the browser to show the permission dialog.
  const openCamera = async (facing = cameraFacing) => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Your browser does not support camera access. Please use Chrome or Safari over HTTPS.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch (err: any) {
      const msg =
        err.name === "NotAllowedError" ? "Camera permission denied. Please allow camera access in your browser/system settings." :
        err.name === "NotFoundError"   ? "No camera found on this device." :
        err.name === "NotReadableError"? "Camera is already in use by another app." :
                                         "Could not start camera. Make sure the page is loaded over HTTPS.";
      setCameraError(msg);
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
  };

  const switchCamera = () => {
    const next = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(next);
    closeCamera();
    setTimeout(() => openCamera(next), 150);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    c.toBlob(blob => {
      if (!blob) return;
      addFiles([new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" })]);
      closeCamera();
    }, "image/jpeg", 0.92);
  };

  // ── Upload ───────────────────────────────────────────────
  const uploadBatch = async () => {
    if (!files.length || !auth.currentUser) return;
    setUploading(true);
    setUploadedCount(0);
    try {
      await Promise.all(files.map(async file => {
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", "Cheerio-2026");
        form.append("folder", "Cheerio/Archives/Images");
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: form }
        );
        const json = await res.json();
        await addDoc(collection(db, "archives"), {
          url: json.secure_url, type: "image",
          userId: auth.currentUser!.uid,
          userName: auth.currentUser!.displayName,
          createdAt: new Date().toISOString(), tag: "General",
        });
        setUploadedCount(p => p + 1);
      }));
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        xp: increment(10 * files.length),
        photoCount: increment(files.length),
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <main className="min-h-screen py-24 px-6 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <ReturnToDashboard />

        {/* Live camera modal */}
        {cameraOpen && (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col">
            <video ref={videoRef} autoPlay playsInline muted className="flex-1 w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex items-center justify-around p-6 gap-6 bg-black/80 backdrop-blur-sm">
              <button onClick={closeCamera} className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all active:scale-90">
                <X size={24} />
              </button>
              {/* Shutter */}
              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-all active:scale-90 flex items-center justify-center"
              >
                <Camera size={32} className="text-white" />
              </button>
              <button onClick={switchCamera} className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all active:scale-90">
                <SwitchCamera size={24} />
              </button>
            </div>
          </div>
        )}

        <div className="theme-card p-8 md:p-12 rounded-[3rem] text-center space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-soft/20 rounded-full text-gold-primary text-[9px] font-bold tracking-widest uppercase">
              <ImageIcon size={12} /> Image Archival
            </div>
            <h1 className="text-4xl font-bold text-brown-primary serif">Seal Memories.</h1>
            <p className="text-brown-secondary italic serif">Upload frames to earn +10 Legacy XP per image.</p>
          </div>

          {!success ? (
            <div className="space-y-6">

              {/* Camera error */}
              {cameraError && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-900/20 border border-red-500/30 text-left">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{cameraError}</p>
                </div>
              )}

              {/* ── Two clear options ── */}
              <div className="grid grid-cols-2 gap-4">
                {/*
                 * OPTION 1: Native file picker (no capture attr)
                 * → On mobile: system sheet pops up asking "Take Photo" OR "Choose from Library"
                 * → On desktop: opens file explorer
                 * The OS/browser handles the permission dialog for camera if user picks "Take Photo"
                 */}
                <label className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gold-primary/30 bg-gold-soft/5 hover:bg-gold-soft/15 active:scale-95 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-gold-soft/10 flex items-center justify-center group-hover:bg-gold-soft/20 transition-all">
                    <ImageIcon size={22} className="text-gold-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brown-primary uppercase tracking-widest">Choose / Capture</p>
                    <p className="text-[9px] text-brown-secondary/50 mt-1">Gallery or Camera</p>
                  </div>
                  {/* No `capture` — lets the OS show its native chooser (Camera / Gallery) */}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleInput} />
                </label>

                {/*
                 * OPTION 2: Desktop live camera via getUserMedia
                 * → Calling getUserMedia is what triggers the browser's permission popup
                 */}
                <button
                  onClick={() => openCamera()}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gold-primary/30 bg-gold-soft/5 hover:bg-gold-soft/15 active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-gold-soft/10 flex items-center justify-center group-hover:bg-gold-soft/20 transition-all">
                    <Camera size={22} className="text-gold-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brown-primary uppercase tracking-widest">Live Camera</p>
                    <p className="text-[9px] text-brown-secondary/50 mt-1">Snap from webcam</p>
                  </div>
                </button>
              </div>

              {/* Drag & drop zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`min-h-[100px] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 p-6 ${
                  isDragging ? "border-gold-primary bg-gold-soft/10" : "border-gold-soft/20"
                }`}
              >
                <Upload size={22} className={isDragging ? "text-gold-primary animate-bounce" : "text-brown-secondary/20"} />
                <p className="text-[9px] font-bold uppercase tracking-widest text-brown-secondary/30">
                  {isDragging ? "Release to add" : "Drag & drop here (desktop)"}
                </p>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gold-soft/20 bg-card-tone group">
                      <Image src={src} fill className="object-cover" alt={`Preview ${idx}`} />
                      <button
                        onClick={() => removeFile(idx)}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg z-20 transition-all hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
                      >
                        <X size={13} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <button
                onClick={uploadBatch}
                disabled={!files.length || uploading}
                className="theme-cinematic-btn-primary w-full py-5 rounded-2xl font-bold uppercase tracking-[0.3em] disabled:opacity-40 flex items-center justify-center gap-3 transition-all"
              >
                {uploading
                  ? <><Loader2 size={20} className="animate-spin" /> Locking {uploadedCount}/{files.length} Memories...</>
                  : `Archive ${files.length > 0 ? files.length + " " : ""}Memories`}
              </button>
            </div>
          ) : (
            <div className="py-12 space-y-8 animate-in zoom-in duration-700">
              <div className="w-24 h-24 bg-card-tone rounded-full flex items-center justify-center text-gold-primary mx-auto shadow-[0_0_50px_rgba(207,174,112,0.2)]">
                <CheckCircle size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-brown-primary serif">Legacy Preserved.</h3>
                <p className="text-gold-primary font-bold uppercase tracking-widest text-sm">+{10 * files.length} XP Awarded</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setSuccess(false); setPreviews([]); setFiles([]); setUploadedCount(0); }}
                  className="flex-1 py-4 border border-gold-soft/40 rounded-xl text-xs font-bold uppercase tracking-widest text-gold-primary">Add More</button>
                <Link href="/dashboard" className="flex-1 py-4 bg-gold-primary text-theme-text-primary rounded-xl text-xs font-bold uppercase tracking-widest text-center">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
