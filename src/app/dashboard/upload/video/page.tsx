"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, increment, collection, addDoc, getDoc } from "firebase/firestore";
import {
  Video as VideoIcon, Upload, CheckCircle, X, Loader2,
  Camera, SwitchCamera, Square, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { ReturnToDashboard } from "@/components/Sidebar";

export default function VideoUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [strikes, setStrikes] = useState<number | null>(null);
  const [strikeWarningDismissed, setStrikeWarningDismissed] = useState(false);
  const [banned, setBanned] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch strikes on mount
  useEffect(() => {
    const checkStrikes = () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userStrikes = userDoc.data()?.strikes || 0;
              setStrikes(userStrikes);
              if (userStrikes >= 3) {
                setBanned(true);
              }
            }
          } catch (error) {
            console.error("Error fetching user strikes:", error);
          }
        }
        setLoading(false);
      });
      return unsubscribe;
    };

    const unsub = checkStrikes();
    return () => unsub();
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── File helpers ─────────────────────────────────────────
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const addFiles = async (newFiles: File[]) => {
    // Accept any video/* type; also accept .webm .mp4 etc by extension as fallback
    const vids = newFiles.filter(f =>
      f.type.startsWith("video/") || /\.(mp4|mov|webm|mkv|avi|m4v|3gp|ogv)$/i.test(f.name)
    );
    if (!vids.length) return;
    
    for (const file of vids) {
      if (file.size > 100 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 100MB and cannot be uploaded.`);
        continue;
      }

      // Check duration
      const duration = await getVideoDuration(file);
      if (duration > 600) {
        alert(`File ${file.name} is longer than 10 minutes and cannot be uploaded. Please cut it into pieces.`);
        continue;
      }

      setFiles(p => [...p, file]);
      setPreviews(p => [...p, URL.createObjectURL(file)]);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const removeFile = (i: number) => {
    setFiles(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  // ── Drag & Drop ──────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  }, []);

  // ── Live camera ──────────────────────────────────────────
  const openCamera = async (facing = cameraFacing) => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not supported. Use Chrome or Firefox over HTTPS.");
      return;
    }
    try {
      // getUserMedia is what triggers the browser's native permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: true,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setIsRecording(false);
      setRecordingSeconds(0);
      // Attach stream after modal mounts
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true; // mute preview to avoid echo
          videoRef.current.play().catch(() => {});
        }
      }, 80);
    } catch (err: any) {
      const msg =
        err.name === "NotAllowedError"    ? "Camera/microphone permission denied. Please allow access in your browser settings and try again." :
        err.name === "NotFoundError"       ? "No camera found on this device." :
        err.name === "NotReadableError"    ? "Camera is already in use by another app." :
                                             "Could not access camera. Make sure the page is on HTTPS.";
      setCameraError(msg);
    }
  };

  const closeCamera = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const switchCamera = () => {
    const next = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(next);
    closeCamera();
    setTimeout(() => openCamera(next), 200);
  };

  // ── Recording ────────────────────────────────────────────
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    // Detect best supported MIME
    const mimeType = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ].find(t => MediaRecorder.isTypeSupported(t)) || "";

    try {
      const mr = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);

      mr.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blobType = mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        const ext = blobType.includes("mp4") ? "mp4" : "webm";
        const file = new File([blob], `recording-${Date.now()}.${ext}`, { type: blobType });
        addFiles([file]);
        // close after adding
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraOpen(false);
        setIsRecording(false);
      };

      mr.start(250);
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch (err) {
      console.error("MediaRecorder error:", err);
      setCameraError("Screen recording is not supported in this browser. Try Chrome or Firefox.");
      closeCamera();
    }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    setIsRecording(false);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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
        form.append("folder", "Cheerio/Archives/Videos");
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
          { method: "POST", body: form }
        );
        const json = await res.json();
        await addDoc(collection(db, "archives"), {
          url: json.secure_url, type: "video",
          userId: auth.currentUser!.uid,
          userName: auth.currentUser!.displayName,
          createdAt: new Date().toISOString(), tag: "General",
        });
        setUploadedCount(p => p + 1);
      }));
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        xp: increment(25 * files.length),
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
  if (loading) {
    return (
      <main className="min-h-screen py-24 px-6 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gold-primary" />
      </main>
    );
  }

  const showStrikeWarning = strikes !== null && (strikes === 1 || strikes === 2) && !strikeWarningDismissed;

  return (
    <main className="min-h-screen py-24 px-6 flex items-center justify-center">
      {/* Full Screen Banned Overlay */}
      {banned && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="max-w-md w-full mx-4 p-8 rounded-3xl bg-red-950/20 border-2 border-red-900/50 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-900/30 flex items-center justify-center">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-red-500 serif tracking-wide">Uploads Disabled</h2>
              <p className="text-red-400/80 text-sm leading-relaxed">
                Your account has accumulated 3 or more strikes due to community guidelines violations. 
                Media upload privileges have been permanently revoked.
              </p>
            </div>
            <div className="pt-4 flex justify-center">
              <Link href="/dashboard" className="px-8 py-3 rounded-xl bg-red-900/40 text-red-400 font-bold tracking-widest uppercase text-xs hover:bg-red-900/60 transition-all border border-red-500/20">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {showStrikeWarning && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="bg-orange-950/90 border border-orange-500/50 p-8 rounded-3xl max-w-md text-center space-y-4 shadow-2xl animate-in zoom-in duration-300">
            <AlertCircle size={48} className="mx-auto text-orange-500 mb-2" />
            <h2 className="text-2xl font-bold text-orange-50 serif">Moderator Warning</h2>
            <p className="text-orange-200/80 text-sm leading-relaxed">
              You have been given strikes by moderators. Please do not engage in such content any more.
            </p>
            <div className="pt-4">
              <button onClick={() => setStrikeWarningDismissed(true)} className="inline-block w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl w-full">
        <ReturnToDashboard />

        {/* ╔══════════════════════════════════════╗
            ║   LIVE CAMERA MODAL (full-screen)    ║
            ╚══════════════════════════════════════╝
            Controls are absolutely positioned at the bottom
            so the video element never covers them.          */}
        {cameraOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000" }}>
            {/* Live video preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            {/* Recording timer — top center */}
            {isRecording && (
              <div style={{
                position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)",
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(220,38,38,0.85)", backdropFilter: "blur(8px)",
                padding: "8px 20px", borderRadius: 999
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", animation: "pulse 1s infinite" }} />
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                  REC {fmt(recordingSeconds)}
                </span>
              </div>
            )}

            {/* Controls bar — absolutely at bottom, always visible */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              display: "flex", alignItems: "center", justifyContent: "space-around",
              padding: "24px 32px",
              background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)"
            }}>
              {/* Close / Cancel */}
              <button
                onClick={closeCamera}
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff"
                }}
              >
                <X size={24} />
              </button>

              {/* RECORD / STOP — the main action button */}
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  title="Start Recording"
                  style={{
                    width: 80, height: 80, borderRadius: "50%",
                    border: "4px solid #ef4444",
                    background: "rgba(239,68,68,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  {/* Red filled circle = record */}
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#ef4444", display: "block" }} />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  title="Stop & Save"
                  style={{
                    width: 80, height: 80, borderRadius: "50%",
                    border: "4px solid #fff",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  {/* White square = stop */}
                  <span style={{ width: 30, height: 30, borderRadius: 4, background: "#fff", display: "block" }} />
                </button>
              )}

              {/* Switch camera */}
              <button
                onClick={switchCamera}
                disabled={isRecording}
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: isRecording ? "not-allowed" : "pointer",
                  opacity: isRecording ? 0.3 : 1, color: "#fff"
                }}
              >
                <SwitchCamera size={24} />
              </button>
            </div>

            {/* Hint label */}
            {!isRecording && (
              <div style={{
                position: "absolute", bottom: 112, left: "50%", transform: "translateX(-50%)",
                color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.15em", whiteSpace: "nowrap"
              }}>
                Tap the red button to start recording
              </div>
            )}
          </div>
        )}

        {/* ── Main Card ── */}
        <div className="theme-card p-8 md:p-12 rounded-[3rem] text-center space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-soft/20 rounded-full text-gold-primary text-[9px] font-bold tracking-widest uppercase">
              <VideoIcon size={12} /> Motion Archival
            </div>
            <h1 className="text-4xl font-bold text-brown-primary serif">Archive Reels.</h1>
            <p className="text-brown-secondary italic serif">Upload motion memories to earn +25 Legacy XP per reel.</p>
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

              {/* ── Source buttons ── */}
              <div className="grid grid-cols-2 gap-4">
                {/*
                 * Native file picker — on mobile the OS sheet shows:
                 *   "Record Video" | "Photo Library"
                 * Camera permission is handled natively by the OS.
                 */}
                <label className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gold-primary/30 bg-gold-soft/5 hover:bg-gold-soft/15 active:scale-95 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-gold-soft/10 flex items-center justify-center group-hover:bg-gold-soft/20 transition-all">
                    <VideoIcon size={22} className="text-gold-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brown-primary uppercase tracking-widest">Choose</p>
                    <p className="text-[9px] text-brown-secondary/50 mt-1">Gallery</p>
                  </div>
                  <input type="file" accept="video/*" multiple className="hidden" onChange={handleInput} />
                </label>

                {/*
                 * Live camera button — calls getUserMedia which triggers
                 * the browser's own "Allow camera + microphone?" dialog.
                 */}
                <button
                  onClick={() => openCamera()}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gold-primary/30 bg-gold-soft/5 hover:bg-gold-soft/15 active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-gold-soft/10 flex items-center justify-center group-hover:bg-gold-soft/20 transition-all">
                    <Camera size={22} className="text-gold-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brown-primary uppercase tracking-widest">Record Live</p>
                    <p className="text-[9px] text-brown-secondary/50 mt-1">Webcam / Camera</p>
                  </div>
                </button>
              </div>

              {/* ── Drag & Drop Zone ─────────────────────────────────
                   Works on desktop. Accepts any video file dragged in.  */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative min-h-[160px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 transition-all duration-200 ${
                  isDragging
                    ? "border-gold-primary bg-gold-soft/15 scale-[1.01]"
                    : "border-gold-soft/25 hover:border-gold-soft/50 hover:bg-gold-soft/5"
                }`}
              >
                <Upload
                  size={30}
                  className={`transition-all duration-200 ${isDragging ? "text-gold-primary scale-110" : "text-brown-secondary/25"}`}
                />
                <div className="space-y-1 text-center">
                  <p className={`text-xs font-bold uppercase tracking-widest transition-colors ${isDragging ? "text-gold-primary" : "text-brown-secondary/40"}`}>
                    {isDragging ? "Release to add videos" : "Drag & drop video files here"}
                  </p>
                  <p className="text-[9px] text-brown-secondary/25 font-medium uppercase tracking-widest">
                    MP4 · MOV · WEBM · MKV · AVI supported
                  </p>
                </div>
                {/* Also allow clicking the zone to browse */}
                <label className="mt-1 px-4 py-2 rounded-xl border border-gold-soft/20 text-[9px] font-bold uppercase tracking-widest text-brown-secondary/40 hover:border-gold-primary/40 hover:text-gold-primary cursor-pointer transition-all">
                  or click to browse
                  <input type="file" accept="video/*" multiple className="hidden" onChange={handleInput} />
                </label>
              </div>

              {/* ── Previews ── */}
              {previews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-gold-soft/20 bg-black group">
                      <video src={src} controls className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeFile(idx)}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg z-20 transition-all hover:bg-red-700 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <X size={13} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Upload button ── */}
              <button
                onClick={uploadBatch}
                disabled={!files.length || uploading}
                className="theme-cinematic-btn-primary w-full py-5 rounded-2xl font-bold uppercase tracking-[0.3em] disabled:opacity-40 flex items-center justify-center gap-3 transition-all"
              >
                {uploading
                  ? <><Loader2 size={20} className="animate-spin" /> Locking {uploadedCount}/{files.length} Reels...</>
                  : `Archive ${files.length > 0 ? files.length + " " : ""}Reels`}
              </button>
            </div>
          ) : (
            <div className="py-12 space-y-8 animate-in zoom-in duration-700">
              <div className="w-24 h-24 bg-card-tone rounded-full flex items-center justify-center text-gold-primary mx-auto shadow-[0_0_50px_rgba(207,174,112,0.2)]">
                <CheckCircle size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-brown-primary serif">Motion Preserved.</h3>
                <p className="text-gold-primary font-bold uppercase tracking-widest text-sm">+{25 * files.length} XP Awarded</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => { setSuccess(false); setPreviews([]); setFiles([]); setUploadedCount(0); }}
                  className="flex-1 py-4 border border-gold-soft/40 rounded-xl text-xs font-bold uppercase tracking-widest text-gold-primary"
                >Add More</button>
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
