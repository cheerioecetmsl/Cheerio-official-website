"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { Camera, Save, User, Mail, GraduationCap, School, CheckCircle, Loader2 } from "lucide-react";
import { ReturnToDashboard } from "@/components/Sidebar";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    section: "",
    photoURL: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || u.displayName || "",
            year: data.year || "1st Year",
            section: data.section || "A",
            photoURL: data.photoURL || u.photoURL || "",
          });
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "Cheerio-2026");
      
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const resData = await res.json();
      setFormData(prev => ({ ...prev, photoURL: resData.secure_url }));
    } catch (err) {
      console.error(err);
      alert("Photo upload failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      // 1. Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        year: formData.year,
        section: formData.section,
        photoURL: formData.photoURL
      });

      // 2. Update Auth Profile
      await updateProfile(user, {
        displayName: formData.name,
        photoURL: formData.photoURL
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark-bg text-gold serif text-2xl animate-pulse">Syncing Profile Sanctum...</div>;

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        
        <ReturnToDashboard />

        <div className="glass-card p-12 rounded-[3rem] border-gold/20 relative overflow-hidden">
          {/* Background Motif */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative space-y-12">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full text-gold text-[9px] font-bold tracking-widest uppercase mb-4">
                <User size={12} /> Profile Sanctum
              </div>
              <h1 className="text-5xl font-bold text-ink dark:text-gold serif">Identity Forge</h1>
              <p className="text-ink/60 dark:text-dark-text/60 italic serif text-lg">Refine how you are remembered in the archives.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-12">
              
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full border-4 border-gold/20 overflow-hidden bg-ink/5 flex items-center justify-center group-hover:border-gold transition-all duration-500 shadow-2xl">
                    {formData.photoURL ? (
                      <img src={formData.photoURL} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="text-gold/20"><User size={60} /></div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={32} className="text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept="image/*"
                  />
                  <div className="absolute bottom-2 right-2 p-3 bg-gold text-ink rounded-full shadow-xl">
                    <Camera size={20} />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">Update Portrait</span>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                    <User size={12} /> Display Name
                  </label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-white/5 dark:bg-black/20 border-b border-gold/20 p-4 outline-none focus:border-gold transition-all text-xl serif text-ink dark:text-gold"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gold/40 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} /> Ledger Email
                  </label>
                  <div className="w-full p-4 text-ink/40 dark:text-dark-text/40 serif text-xl border-b border-gold/5">
                    {user?.email}
                  </div>
                </div>

                {/* Year Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap size={12} /> Academic Year
                  </label>
                  <select 
                    className="w-full bg-white/5 dark:bg-black/20 border-b border-gold/20 p-4 outline-none focus:border-gold transition-all text-xl serif text-ink dark:text-gold appearance-none"
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: e.target.value})}
                  >
                    <option className="bg-dark-bg" value="1st Year">1st Year</option>
                    <option className="bg-dark-bg" value="2nd Year">2nd Year</option>
                    <option className="bg-dark-bg" value="3rd Year">3rd Year</option>
                  </select>
                </div>

                {/* Section Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                    <School size={12} /> Assigned Section
                  </label>
                  <select 
                    className="w-full bg-white/5 dark:bg-black/20 border-b border-gold/20 p-4 outline-none focus:border-gold transition-all text-xl serif text-ink dark:text-gold appearance-none"
                    value={formData.section}
                    onChange={e => setFormData({...formData, section: e.target.value})}
                  >
                    <option className="bg-dark-bg" value="A">Section A</option>
                    <option className="bg-dark-bg" value="B">Section B</option>
                    <option className="bg-dark-bg" value="C">Section C</option>
                    <option className="bg-dark-bg" value="D">Section D</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button 
                  type="submit"
                  disabled={saving}
                  className="gold-button w-full py-6 rounded-2xl font-bold uppercase tracking-[0.4em] text-sm shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Forging Identity...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle size={20} className="text-ink" />
                      Changes Saved
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Seal Changes
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
