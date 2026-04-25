"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Camera, ChevronRight, Check } from "lucide-react";

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
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        ...formData,
        xp: 0,
        photoCount: 0,
        createdAt: new Date().toISOString(),
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

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        <StepIndicator />

        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold serif text-ink dark:text-gold">The Archivist Identity</h1>
              <p className="text-ink/60 dark:text-dark-text/60 italic serif">How shall you be remembered in the Cheerio?</p>
            </div>

            <div className="relative w-40 h-40 mx-auto group">
              <div className="w-full h-full rounded-full border-4 border-gold/20 overflow-hidden bg-ink/5 flex items-center justify-center group-hover:border-gold transition-colors">
                {formData.photoURL ? (
                  <img src={formData.photoURL} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <Camera size={40} className="text-gold/40" />
                )}
              </div>
              <input 
                type="file" 
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
              <div className="absolute bottom-2 right-2 p-2 bg-gold text-ink rounded-full shadow-lg">
                <Camera size={16} />
              </div>
            </div>

            <div className="space-y-4">
              <input 
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/50 dark:bg-black/20 border-b-2 border-gold/10 p-4 outline-none focus:border-gold transition-all text-center text-xl serif"
              />
              <button 
                disabled={!formData.name || !formData.photoURL || loading}
                onClick={() => setStep(2)}
                className="gold-button w-full py-4 rounded-xl font-bold tracking-widest uppercase disabled:opacity-50"
              >
                {loading ? "Preparing..." : "Continue"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold serif text-ink dark:text-gold">Your Legacy</h1>
              <p className="text-ink/60 dark:text-dark-text/60 italic serif">Define your place in the batch of 2026.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gold">Academic Year</label>
                <div className="flex gap-4">
                  {["1st Year", "2nd Year", "3rd Year"].map(y => (
                    <button 
                      key={y}
                      onClick={() => setFormData({ ...formData, year: y })}
                      className={`flex-1 p-4 rounded-xl border transition-all font-bold uppercase tracking-widest text-xs ${
                        formData.year === y ? "bg-gold text-ink border-gold" : "border-gold/10 text-ink/60"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gold">Assigned Section</label>
                <div className="flex gap-4">
                  {["A", "B", "C", "D"].map(s => (
                    <button 
                      key={s}
                      onClick={() => setFormData({ ...formData, section: s })}
                      className={`flex-1 p-4 rounded-xl border transition-all font-bold uppercase tracking-widest text-xs ${
                        formData.section === s ? "bg-gold text-ink border-gold" : "border-gold/10 text-ink/60"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(3)}
              className="gold-button w-full py-4 rounded-xl font-bold tracking-widest uppercase"
            >
              Set in Stone
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 py-12">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-8">
              <Check size={40} />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold serif text-ink dark:text-gold">Welcome to Cheerio</h1>
              <p className="text-ink/60 dark:text-dark-text/60 italic serif text-xl">
                The ledger is ready. Your journey with the 2026 batch begins now.
              </p>
            </div>
            <button 
              onClick={handleComplete}
              className="gold-button w-full py-5 rounded-xl font-bold tracking-widest uppercase text-xl shadow-2xl"
            >
              Begin the Journey
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
