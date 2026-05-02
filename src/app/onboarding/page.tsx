"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Camera, ChevronRight, Check, GraduationCap, Star, User, BookOpen, Hash, FileText, RefreshCw, ArrowRight, Loader2, CheckCircle2, AlertTriangle, X, Compass } from "lucide-react";
import confetti from "canvas-confetti";
import { User as FirebaseUser } from "firebase/auth";
// Removed next/image for static asset delivery
import { motion, AnimatePresence } from "framer-motion";
import { archiveProfilePhoto } from "@/lib/image-archive";
import { uploadProcessedImage } from "@/lib/uploadHelper";
import { CheerioImage, getDownloadUrl } from "@/lib/imageVariants";

interface OnboardingFormData {
  name: string;
  year: string;
  section: string;
  photoURL: string;
  photoBaseId: string;
  role: string;
  narrative: string;
  univRollNo: string;
  gender: "Sir" | "Madam" | "";
  category: "STUDENT" | "LEGEND" | "FACULTY";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [faceStatus, setFaceStatus] = useState<'idle'|'checking'|'face-found'|'no-face'|'error'>('idle');
  const [gmailPhotoURL, setGmailPhotoURL] = useState('');
  const [skipTutorial, setSkipTutorial] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const hiddenImgRef = useRef<HTMLImageElement | null>(null);
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: "",
    year: "1st Year",
    section: "A",
    photoURL: "",
    photoBaseId: "",
    role: "",
    narrative: "",
    univRollNo: "",
    gender: "",
    category: "STUDENT",
  });

  // ── Face Detection ─────────────────────────────────────────
  const runFaceDetection = async (url: string) => {
    setFaceStatus('checking');
    try {
      const faceapi = await import('face-api.js');
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      }

      // Google profile photos don't support CORS from the browser.
      // Route them through our server-side proxy so face-api.js can
      // read the pixel data via canvas without a security error.
      const detectionUrl = url.includes('googleusercontent.com')
        ? `/api/img-proxy?url=${encodeURIComponent(url)}`
        : url;

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = detectionUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload  = () => resolve();
        img.onerror = () => reject(new Error('load failed'));
      });
      hiddenImgRef.current = img;
      const result = await faceapi.detectSingleFace(
        img,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.4 })
      );
      setFaceStatus(result ? 'face-found' : 'no-face');
    } catch {
      setFaceStatus('error');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setFormData(prev => ({ ...prev, name: u.displayName || '' }));

        // Prefer the ORIGINAL Google account photo from providerData.
        // u.photoURL gets overwritten if updateProfile() was ever called
        // (e.g. from a previous onboarding or settings page), which causes
        // it to point to a Cloudinary URL instead of the Gmail photo.
        // u.providerData[].photoURL is always the raw OAuth provider photo.
        const googleProvider = u.providerData.find(
          (p) => p.providerId === 'google.com'
        );
        const gmailPhoto = googleProvider?.photoURL || u.photoURL;

        if (gmailPhoto) {
          setGmailPhotoURL(gmailPhoto);
          setFormData(prev => ({ ...prev, photoURL: gmailPhoto }));
          runFaceDetection(gmailPhoto);
        }
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (step === 3 && formData.year === "4th Year") {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [step, formData.year]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { baseId } = await uploadProcessedImage(file, "Avatars");
      const url = getDownloadUrl(baseId, "gallery");
      setFormData(prev => ({ ...prev, photoURL: url, photoBaseId: baseId }));
      setGmailPhotoURL(''); // now a custom upload
      runFaceDetection(url);
    } catch (err) {
      console.error(err);
      alert('Photo upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setShowTutorialModal(true);
  };

  const finalizeOnboarding = async (skipped: boolean) => {
    if (!user) return;
    setLoading(true);
    try {
      const isPending = formData.year === "4th Year" || formData.year === "Faculty";
      
      // Archive Google photo to Cloudinary if necessary
      const { url: archivedPhotoURL, baseId: archivedBaseId } = await archiveProfilePhoto(formData.photoURL);
      const finalBaseId = archivedBaseId || formData.photoBaseId;
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        ...formData,
        photoURL: archivedPhotoURL, // Use archived URL
        photoBaseId: finalBaseId,
        xp: 0,
        photoCount: 0,
        createdAt: new Date().toISOString(),
        status: isPending ? "pending" : "approved",
        hasSeenTutorial: skipped, 
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFacultyOrSenior = formData.year === "4th Year" || formData.year === "Faculty";

  return (
    <main className="theme-cinematic min-h-screen flex items-center justify-center p-6 py-24">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        <StepIndicator step={step} />

        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold serif text-brown-primary">The Identity Forge</h1>
              <p className="text-brown-secondary italic serif">Capture your portrait and sign the registry.</p>
            </div>

            {/* ── Smart Photo Section ── */}
            <div className="flex flex-col items-center gap-4">

              {/* Photo circle */}
              <div className="relative w-40 h-40 mx-auto">
                <div
                  className="w-full h-full rounded-full border-4 overflow-hidden flex items-center justify-center shadow-2xl transition-colors"
                  style={{
                    borderColor:
                      faceStatus === 'face-found' ? 'var(--color-gold-primary)'
                    : faceStatus === 'no-face'    ? '#D97706'
                    :                               'var(--color-gold-soft)',
                    background: 'var(--color-card-tone)',
                  }}
                >
                  {formData.photoURL || formData.photoBaseId ? (
                    <div className="relative w-full h-full">
                      <CheerioImage 
                        baseId={formData.photoBaseId} 
                        fallbackUrl={formData.photoURL} 
                        variant="avatar"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <Camera size={40} className="text-gold-soft" />
                  )}
                </div>

                {/* Status badge */}
                {faceStatus === 'checking' && (
                  <div className="absolute -bottom-1 -right-1 p-2 rounded-full border border-gold-soft shadow" style={{ background: 'var(--color-parchment-base)' }}>
                    <Loader2 size={18} className="text-gold-primary animate-spin" />
                  </div>
                )}
                {faceStatus === 'face-found' && (
                  <div className="absolute -bottom-1 -right-1 p-2 rounded-full border border-gold-primary shadow" style={{ background: 'var(--color-parchment-base)' }}>
                    <CheckCircle2 size={18} className="text-gold-primary" />
                  </div>
                )}
                {faceStatus === 'no-face' && (
                  <div className="absolute -bottom-1 -right-1 p-2 rounded-full shadow" style={{ background: '#FEF2F2', border: '2px solid #EF4444' }}>
                    <AlertTriangle size={18} className="text-red-500" />
                  </div>
                )}

                {/* Hidden upload input — always accessible */}
                <input
                  type="file"
                  onChange={handlePhotoUpload}
                  id="photo-upload-input"
                  className="absolute inset-0 opacity-0 z-10"
                  accept="image/*"
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* ── Contextual Callout ── */}
              {faceStatus === 'checking' && (
                <p className="text-xs text-brown-secondary italic animate-pulse serif">Checking your photo for a face...</p>
              )}

              {faceStatus === 'face-found' && (
                <div className="flex items-start gap-3 rounded-2xl px-4 py-3 text-left max-w-xs border" style={{ background: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.3)' }}>
                  <ArrowRight size={16} className="text-gold-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--color-brown-primary)' }}>
                      Your Google photo looks great! Would you like to use it as your profile picture, or would you prefer to change it?
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'var(--color-gold-primary)', color: 'var(--color-theme-text-primary)' }}
                      >
                        <Check size={11} /> Use this photo
                      </button>
                      <label
                        htmlFor="photo-upload-input"
                        className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors hover:border-gold-primary hover:text-gold-primary"
                        style={{ borderColor: 'var(--color-gold-soft)', color: 'var(--color-brown-secondary)' }}
                      >
                        <RefreshCw size={11} /> Change it
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {faceStatus === 'no-face' && (
                <div
                  className="rounded-2xl px-4 py-4 text-left w-full max-w-xs space-y-3"
                  style={{
                    background: 'rgba(245,158,11,0.07)',
                    border: '1.5px solid rgba(245,158,11,0.45)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500">
                      Close-up Recommended
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-brown-primary)' }}>
                    Your photo is not a close-up shot of your face. Do you like to give a close-up shot of your face?
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {/* Keep it for now — muted */}
                    <button
                      type="button"
                      onClick={() => setFaceStatus('idle')}
                      className="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all hover:border-amber-400 hover:text-amber-500"
                      style={{ borderColor: 'rgba(245,158,11,0.3)', color: 'var(--color-brown-secondary)' }}
                    >
                      Keep &amp; change later
                    </button>
                    {/* Put my face now — yellow CTA */}
                    <label
                      htmlFor="photo-upload-input"
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer text-black transition-all hover:brightness-110 active:scale-95"
                      style={{ background: '#F59E0B' }}
                    >
                      <RefreshCw size={11} /> Put my face now
                    </label>
                  </div>
                </div>
              )}

              {/* Fallback: no Gmail photo or detection errored, show upload prompt */}
              {(faceStatus === 'idle' || faceStatus === 'error') && !formData.photoURL && (
                <label
                  htmlFor="photo-upload-input"
                  className="flex items-center gap-2 px-4 py-2 border border-gold-soft text-brown-secondary rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-gold-primary hover:text-gold-primary transition-colors"
                >
                  <Camera size={13} /> Upload your photo
                </label>
              )}
              {faceStatus === 'error' && formData.photoURL && (
                <p className="text-xs text-brown-secondary/60 italic serif">Photo loaded. You can change it anytime.</p>
              )}

            </div>

            <div className="space-y-8 text-left">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brown-primary block">Current Academic Station</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {["1st Year", "2nd Year", "3rd Year", "4th Year", "Faculty"].map(y => (
                    <button 
                      key={y}
                      onClick={() => setFormData({ 
                        ...formData, 
                        year: y,
                        category: y === "4th Year" ? "LEGEND" : y === "Faculty" ? "FACULTY" : "STUDENT"
                      })}
                      className={`p-4 rounded-xl border transition-all font-bold uppercase tracking-tighter text-[9px] flex flex-col items-center gap-2 ${
                        formData.year === y ? "bg-gold-primary text-theme-text-primary border-gold-primary" : "border-gold-soft text-brown-secondary hover:border-gold-primary"
                      }`}
                    >
                      {y === "4th Year" ? <Star size={16} /> : y === "Faculty" ? <GraduationCap size={16} /> : <User size={16} />}
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {formData.year !== "Faculty" && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brown-primary block">Univ Roll No (Mandatory)</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-soft" />
                    <input 
                      type="text"
                      placeholder="e.g. 12345678"
                      value={formData.univRollNo}
                      onChange={(e) => setFormData({ ...formData, univRollNo: e.target.value })}
                      className="w-full theme-cinematic-input p-4 pl-12 rounded-2xl text-sm font-bold tracking-widest"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brown-primary block">Legal Name</label>
                <input 
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full theme-cinematic-input p-4 rounded-2xl text-xl serif"
                />
              </div>

              <button 
                disabled={!formData.name || !formData.photoURL || (formData.year !== "Faculty" && !formData.univRollNo) || loading}
                onClick={() => setStep(2)}
                className="theme-cinematic-btn-primary w-full py-5 rounded-2xl font-bold tracking-widest uppercase disabled:opacity-50 mt-4"
              >
                {loading ? "Forging..." : "Forge Identity"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold serif text-brown-primary">Station & Legacy</h1>
              <p className="text-brown-secondary italic serif">Refining your archives in the Batch of 2026.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 text-left">

              {formData.year !== "Faculty" && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brown-primary">Assigned Section</label>
                  <div className="flex gap-3">
                    {["A", "B", "C", "D"].map(s => (
                      <button 
                        key={s}
                        onClick={() => setFormData({ ...formData, section: s })}
                        className={`flex-1 p-4 rounded-xl border transition-all font-bold uppercase tracking-widest text-xs ${
                          formData.section === s ? "bg-gold-primary text-theme-text-primary border-gold-primary" : "border-gold-soft text-brown-secondary hover:border-gold-primary"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isFacultyOrSenior && (
                <div className="space-y-6 animate-in slide-in-from-top-4">
                  {formData.year === "4th Year" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brown-primary flex items-center gap-2">
                        <BookOpen size={14} /> Write something fun about yourself
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Code by day, gamer by night"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full theme-cinematic-input p-4 rounded-xl text-sm font-bold uppercase tracking-widest"
                      />
                    </div>
                  )}
                  {formData.year === "Faculty" && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brown-primary block">Honorific Station</label>
                      <div className="flex gap-4">
                        {["Sir", "Madam"].map((g) => (
                          <button
                            key={g}
                            onClick={() => setFormData({ ...formData, gender: g as "Sir" | "Madam" })}
                            className={`flex-1 p-4 rounded-xl border transition-all font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
                              formData.gender === g ? "bg-gold-primary text-theme-text-primary border-gold-primary" : "border-gold-soft text-brown-secondary hover:border-gold-primary"
                            }`}
                          >
                            <User size={14} /> {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brown-primary flex items-center gap-2">
                      <FileText size={14} /> Brief Narrative
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="A brief legacy note for the archives..."
                      value={formData.narrative}
                      onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
                      className="w-full theme-cinematic-input p-4 rounded-xl text-sm italic serif"
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              disabled={isFacultyOrSenior && (!formData.narrative || (formData.year === "4th Year" && !formData.role) || (formData.year === "Faculty" && !formData.gender))}
              onClick={() => setStep(3)}
              className="theme-cinematic-btn-primary w-full py-5 rounded-2xl font-bold tracking-widest uppercase disabled:opacity-50"
            >
              Seal Station
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 py-12">
            <div className="w-24 h-24 bg-parchment-contrast rounded-full flex items-center justify-center text-gold-primary mx-auto mb-8 shadow-2xl animate-float">
              <Check size={48} />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold serif text-brown-primary leading-tight">
                {formData.year === "4th Year" ? "A Legend Emerges." : "Identity Verified."}
              </h1>
              <p className="text-brown-secondary italic serif text-xl max-w-sm mx-auto">
                {isFacultyOrSenior 
                  ? "Your profile is being processed for the community archives. You may access the dashboard while we verify your legacy."
                  : "The ledger is ready. Your journey with the 2026 batch begins now."}
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="theme-cinematic-btn-primary w-full py-6 rounded-2xl font-bold tracking-widest uppercase text-xl transition-all"
            >
              {loading ? 'Sealing...' : 'Begin the Journey'}
            </button>
          </div>
        )}

        <AnimatePresence>
          {showTutorialModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-parchment-base/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-parchment-base border border-gold-soft/30 rounded-[2.5rem] p-10 shadow-2xl text-center space-y-8"
              >
                <div className="w-20 h-20 bg-gold-primary/10 rounded-full flex items-center justify-center text-gold-primary mx-auto shadow-inner">
                  <Compass size={36} className="animate-pulse" />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold serif text-brown-primary">The Path Ahead</h2>
                  <p className="text-brown-secondary italic serif text-lg leading-relaxed">
                    Would you like a quick guided tour of the dashboard, or are you ready to explore on your own?
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => finalizeOnboarding(false)}
                    disabled={loading}
                    className="w-full py-5 bg-gold-primary text-theme-text-primary rounded-2xl font-bold tracking-widest uppercase text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Show me around!
                  </button>
                  <button
                    onClick={() => finalizeOnboarding(true)}
                    disabled={loading}
                    className="w-full py-5 border border-gold-soft/50 text-brown-secondary rounded-2xl font-bold tracking-widest uppercase text-sm hover:bg-gold-soft/10 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={16} /> Skip the tutorial
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>


      </div>
    </main>
  );
}

const StepIndicator = ({ step }: { step: number }) => (
  <div className="flex items-center justify-center gap-4 mb-12">
    {[1, 2, 3].map((s) => (
      <div 
        key={s}
        className={`h-1 w-12 rounded-full transition-all duration-500 ${
          s <= step ? "bg-gold-primary" : "bg-gold-soft/30"
        }`}
      />
    ))}
  </div>
);
