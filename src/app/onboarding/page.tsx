"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Camera, ChevronRight, Check, GraduationCap, Star, User, BookOpen, Hash, FileText } from "lucide-react";
import confetti from "canvas-confetti";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year: "1st Year",
    section: "A",
    photoURL: "",
    role: "",
    narrative: "",
    univRollNo: "",
    gender: "" as "Sir" | "Madam" | "",
    category: "STUDENT" as "STUDENT" | "LEGEND" | "FACULTY",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setFormData(prev => ({ ...prev, name: u.displayName || "" }));
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (step === 3 && formData.year === "4th Year") {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
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
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
      
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const resData = await res.json();
      setFormData({ ...formData, photoURL: resData.secure_url });
    } catch (err) {
      console.error(err);
      alert("Photo upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const isPending = formData.year === "4th Year" || formData.year === "Faculty";
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        ...formData,
        xp: 0,
        photoCount: 0,
        createdAt: new Date().toISOString(),
        status: isPending ? "pending" : "approved",
        hasSeenTutorial: false,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-12">
      {[1, 2, 3].map((s) => (
        <div 
          key={s}
          className={`h-1 w-12 rounded-full transition-all duration-500 ${
            s <= step ? "bg-gold" : "bg-gold/10"
          }`}
        />
      ))}
    </div>
  );

  const isFacultyOrSenior = formData.year === "4th Year" || formData.year === "Faculty";

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg flex items-center justify-center p-6 py-24">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        <StepIndicator />

        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold serif text-ink dark:text-gold">The Identity Forge</h1>
              <p className="text-ink/60 dark:text-dark-text/60 italic serif">Capture your portrait and sign the registry.</p>
            </div>

            <div className="relative w-40 h-40 mx-auto group">
              <div className="w-full h-full rounded-full border-4 border-gold/20 overflow-hidden bg-ink/5 flex items-center justify-center group-hover:border-gold transition-colors shadow-2xl">
                {formData.photoURL ? (
                  <img src={formData.photoURL} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <Camera size={40} className="text-gold/40" />
                )}
              </div>
              <input 
                type="file" 
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                accept="image/*"
              />
              <div className="absolute bottom-2 right-2 p-3 bg-gold text-ink rounded-full shadow-lg">
                <Camera size={18} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gold text-left block">Legal Name</label>
                <input 
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/50 dark:bg-black/20 border border-gold/10 p-4 rounded-2xl outline-none focus:border-gold transition-all text-xl serif"
                />
              </div>

              {formData.year !== "Faculty" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gold text-left block">Univ Roll No (Mandatory)</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40" />
                    <input 
                      type="text"
                      placeholder="e.g. 12345678"
                      value={formData.univRollNo}
                      onChange={(e) => setFormData({ ...formData, univRollNo: e.target.value })}
                      className="w-full bg-white/50 dark:bg-black/20 border border-gold/10 p-4 pl-12 rounded-2xl outline-none focus:border-gold transition-all text-sm font-bold tracking-widest"
                    />
                  </div>
                </div>
              )}

              <button 
                disabled={!formData.name || !formData.photoURL || (formData.year !== "Faculty" && !formData.univRollNo) || loading}
                onClick={() => setStep(2)}
                className="gold-button w-full py-5 rounded-2xl font-bold tracking-widest uppercase disabled:opacity-50 shadow-xl"
              >
                {loading ? "Forging..." : "Forge Identity"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold serif text-ink dark:text-gold">Station & Legacy</h1>
              <p className="text-ink/60 dark:text-dark-text/60 italic serif">Where do you stand in the Batch of 2026?</p>
            </div>

            <div className="grid grid-cols-1 gap-8 text-left">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gold">Current Academic Station</label>
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
                        formData.year === y ? "bg-gold text-ink border-gold" : "border-gold/10 text-ink/60 hover:border-gold/30"
                      }`}
                    >
                      {y === "4th Year" ? <Star size={16} /> : y === "Faculty" ? <GraduationCap size={16} /> : <User size={16} />}
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {formData.year !== "Faculty" && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gold">Assigned Section</label>
                  <div className="flex gap-3">
                    {["A", "B", "C", "D"].map(s => (
                      <button 
                        key={s}
                        onClick={() => setFormData({ ...formData, section: s })}
                        className={`flex-1 p-4 rounded-xl border transition-all font-bold uppercase tracking-widest text-xs ${
                          formData.section === s ? "bg-gold text-ink border-gold" : "border-gold/10 text-ink/60 hover:border-gold/30"
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
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                        <BookOpen size={14} /> Role / Designation
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Lead Sculptor / Batch Rep"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-white/50 dark:bg-black/20 border border-gold/10 p-4 rounded-xl outline-none focus:border-gold transition-all text-sm font-bold uppercase tracking-widest"
                      />
                    </div>
                  )}
                  {formData.year === "Faculty" && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gold block">Honorific Station</label>
                      <div className="flex gap-4">
                        {["Sir", "Madam"].map((g) => (
                          <button
                            key={g}
                            onClick={() => setFormData({ ...formData, gender: g as "Sir" | "Madam" })}
                            className={`flex-1 p-4 rounded-xl border transition-all font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
                              formData.gender === g ? "bg-gold text-ink border-gold" : "border-gold/10 text-ink/60 hover:border-gold/30"
                            }`}
                          >
                            <User size={14} /> {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                      <FileText size={14} /> Brief Narrative
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="A brief legacy note for the archives..."
                      value={formData.narrative}
                      onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
                      className="w-full bg-white/50 dark:bg-black/20 border border-gold/10 p-4 rounded-xl outline-none focus:border-gold transition-all text-sm italic serif"
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              disabled={isFacultyOrSenior && (!formData.narrative || (formData.year === "4th Year" && !formData.role) || (formData.year === "Faculty" && !formData.gender))}
              onClick={() => setStep(3)}
              className="gold-button w-full py-5 rounded-2xl font-bold tracking-widest uppercase shadow-xl disabled:opacity-50"
            >
              Seal Station
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 py-12">
            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-8 shadow-2xl animate-bounce">
              <Check size={48} />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold serif text-ink dark:text-gold leading-tight">
                {formData.year === "4th Year" ? "A Legend Emerges." : "Identity Verified."}
              </h1>
              <p className="text-ink/60 dark:text-dark-text/60 italic serif text-xl max-w-sm mx-auto">
                {isFacultyOrSenior 
                  ? "Your profile is being processed for the community archives. You may access the dashboard while we verify your legacy."
                  : "The ledger is ready. Your journey with the 2026 batch begins now."}
              </p>
            </div>
            <button 
              onClick={handleComplete}
              className="gold-button w-full py-6 rounded-2xl font-bold tracking-widest uppercase text-xl shadow-2xl hover:scale-105 transition-all"
            >
              Begin the Journey
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
