"use client";

import { useState, useEffect } from "react";
import { ReturnToDashboard } from "@/components/Sidebar";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Search, Sparkles, Scan, CheckCircle, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import * as faceapi from "face-api.js";

const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";

export default function FaceFinder() {
  const [userData, setUserData] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserData(docSnap.data());
      }
    });

    // Pre-load models when component mounts
    const loadModels = async () => {
      try {
        setStatus("Initializing Neural Engine...");
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setStatus("Neural Engine Ready");
      } catch (err) {
        console.error("Model Loading Error:", err);
        setError("Failed to initialize neural engine. Check your connection.");
      }
    };
    loadModels();

    return () => unsubscribe();
  }, []);

  const startScan = async () => {
    if (!userData?.photoURL) {
      setError("Archive profile portrait missing. Please update your settings.");
      return;
    }
    
    setScanning(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      // 1. Get Reference Descriptor
      setStatus("Analyzing Profile Portrait...");
      const refImg = await faceapi.fetchImage(userData.photoURL);
      const refDetection = await faceapi.detectSingleFace(refImg).withFaceLandmarks().withFaceDescriptor();
      
      if (!refDetection) {
        setError("No face detected in your profile portrait. Please use a clearer photo.");
        setScanning(false);
        return;
      }
      
      const faceMatcher = new faceapi.FaceMatcher(refDetection);

      // 2. Fetch Archive Images
      setStatus("Accessing Multimedia Vault...");
      const archiveSnap = await getDocs(collection(db, "archive"));
      const archiveItems = archiveSnap.docs.map(doc => doc.data());
      
      if (archiveItems.length === 0) {
        setError("The archive vault is empty. No memories to scan.");
        setScanning(false);
        return;
      }

      // 3. Scan Archive
      const matchedUrls: string[] = [];
      const total = archiveItems.length;

      for (let i = 0; i < total; i++) {
        const item = archiveItems[i];
        if (item.type !== 'image') continue;

        setProgress(Math.round(((i + 1) / total) * 100));
        setStatus(`Scanning Memory ${i + 1} of ${total}...`);

        try {
          const img = await faceapi.fetchImage(item.url);
          const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
          
          const matches = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
          const isMe = matches.some(match => match.label !== 'unknown' && match.distance < 0.6);

          if (isMe) {
            matchedUrls.push(item.url);
          }
        } catch (imgErr) {
          console.warn("Failed to process image:", item.url, imgErr);
        }
      }

      setResults(matchedUrls);
      setStatus("Discovery Complete");
    } catch (err) {
      console.error("Discovery Error:", err);
      setError("A neural disruption occurred during discovery. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8">
      <ReturnToDashboard />
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full text-gold text-[10px] font-bold tracking-[0.3em] uppercase">
            <Sparkles size={14} /> AI Recognition Engine
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-ink dark:text-gold serif">Find Your Moments.</h1>
          <p className="text-ink/60 dark:text-dark-text/60 italic serif text-lg max-w-2xl mx-auto">
            Our neural engine scans every pixel in the batch archive to reclaim your story. 
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-md mx-auto p-4 bg-red-900/10 border border-red-900/20 rounded-2xl flex items-center gap-4 text-red-500 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={24} />
            <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
          </div>
        )}

        {/* Scanner UI */}
        <div className="glass-card p-12 rounded-[3rem] border-gold/20 flex flex-col items-center justify-center space-y-10 relative overflow-hidden">
          {scanning && (
            <div className="absolute inset-0 bg-gold/5 animate-pulse" />
          )}

          <div className="relative">
            <div className={`w-48 h-48 rounded-full border-4 transition-all duration-700 ${
              scanning ? "border-gold animate-pulse scale-110" : "border-gold/20"
            } overflow-hidden shadow-2xl bg-gold/5`}>
              <img src={userData?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"} className="w-full h-full object-cover" alt="Reference" />
            </div>
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-gold shadow-[0_0_20px_#d4af37] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            )}
          </div>

          <div className="w-full max-w-md space-y-4">
            {!scanning && results.length === 0 && (
              <button 
                onClick={startScan}
                className="gold-button w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-lg flex items-center justify-center gap-3 shadow-2xl"
              >
                <Scan size={24} />
                Start AI Discovery
              </button>
            )}

            {scanning && (
              <div className="space-y-4 text-center">
                <div className="h-2 w-full bg-ink/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gold transition-all duration-300 shadow-[0_0_10px_#d4af37]" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-gold font-bold uppercase tracking-widest animate-pulse">
                    {status}
                  </p>
                  <p className="text-[10px] text-gold/40 font-bold tabular-nums tracking-widest">
                    {progress}% Complete
                  </p>
                </div>
              </div>
            )}

            {results.length > 0 && !scanning && (
              <div className="text-center space-y-8 animate-in zoom-in fade-in duration-700">
                <div className="flex items-center justify-center gap-3 text-gold">
                  <CheckCircle size={28} className="text-green-500 shadow-xl" />
                  <span className="text-2xl font-bold serif tracking-widest uppercase">{results.length} Moments Reclaimed!</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {results.map((url, i) => (
                    <div key={i} className="group relative aspect-square rounded-3xl overflow-hidden border-2 border-gold/20 shadow-2xl">
                      <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Found" />
                      <div className="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[8px] font-bold text-ink bg-gold px-3 py-1 rounded-full uppercase tracking-widest">Moment {i+1}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setResults([])}
                  className="px-8 py-3 border border-gold/20 rounded-xl text-gold font-bold uppercase tracking-widest text-[10px] hover:bg-gold/5 transition-all"
                >
                  Initiate New Discovery
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl border-gold/10 space-y-4">
            <h4 className="text-gold font-bold uppercase tracking-widest text-xs">Biometric Extraction</h4>
            <p className="text-xs text-ink/60 dark:text-dark-text/60 leading-relaxed serif italic">
              We extract a unique facial descriptor from your profile portrait to serve as a neural fingerprint.
            </p>
          </div>
          <div className="glass-card p-8 rounded-3xl border-gold/10 space-y-4">
            <h4 className="text-gold font-bold uppercase tracking-widest text-xs">Neural Archive Scan</h4>
            <p className="text-xs text-ink/60 dark:text-dark-text/60 leading-relaxed serif italic">
              Our engine performs a sequential analysis of every memory in the vault, comparing signatures in real-time.
            </p>
          </div>
          <div className="glass-card p-8 rounded-3xl border-gold/10 space-y-4">
            <h4 className="text-gold font-bold uppercase tracking-widest text-xs">Precision Discovery</h4>
            <p className="text-xs text-ink/60 dark:text-dark-text/60 leading-relaxed serif italic">
              Only memories with a high neural similarity score are surfaced, ensuring you reclaim only verified moments.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-100px); opacity: 0; }
          50% { transform: translateY(100px); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
