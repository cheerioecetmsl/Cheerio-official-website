"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { Camera, Save, User, Mail, GraduationCap, School, CheckCircle, Loader2, Star } from "lucide-react";
import { ReturnToDashboard } from "@/components/Sidebar";
// Removed next/image for static asset delivery
import { User as FirebaseUser } from "firebase/auth";
import { archiveProfilePhoto } from "@/lib/image-archive";
import { getRawCloudinaryUrl } from "@/lib/cloudinary";
import { uploadProcessedImage } from "@/lib/uploadHelper";
import { CheerioImage, getDownloadUrl } from "@/lib/imageVariants";

export default function SettingsPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    section: "",
    photoURL: "",
    photoBaseId: "",
    category: "STUDENT",
    narrative: "",
    role: "",
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
            photoBaseId: data.photoBaseId || "",
            category: data.category || "STUDENT",
            narrative: data.narrative || "",
            role: data.role || "",
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
      const { baseId } = await uploadProcessedImage(file, "Avatars");
      const url = getDownloadUrl(baseId, "gallery");
      setFormData(prev => ({ ...prev, photoURL: url, photoBaseId: baseId }));
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
      // Archive Google photo to Cloudinary if necessary
      const { url: archivedPhotoURL, baseId: archivedBaseId } = await archiveProfilePhoto(formData.photoURL);
      const finalBaseId = archivedBaseId || formData.photoBaseId;

      // 1. Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        year: formData.year,
        section: formData.section,
        photoURL: archivedPhotoURL,
        photoBaseId: finalBaseId,
        narrative: formData.narrative,
        role: formData.role
      });

      // 2. Update Auth Profile
      await updateProfile(user, {
        displayName: formData.name,
        photoURL: archivedPhotoURL
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

  if (loading) return <div className="theme-cinematic min-h-screen flex items-center justify-center text-brown-primary serif text-2xl animate-pulse">Syncing Profile Sanctum...</div>;

  return (
    <main className="min-h-screen py-24 px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        
        <ReturnToDashboard />

        <div className="theme-card p-12 rounded-[3rem] relative overflow-hidden">
          {/* Background Motif */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative space-y-12">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-soft/20 rounded-full text-gold-primary text-[9px] font-bold tracking-widest uppercase mb-4">
                <User size={12} /> Profile Sanctum
              </div>
              <h1 className="text-5xl font-bold text-brown-primary serif">Identity Forge</h1>
              <p className="text-brown-secondary italic serif text-lg">Refine how you are remembered in the archives.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-12">
              
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full border-4 border-gold-soft/40 overflow-hidden bg-card-tone flex items-center justify-center group-hover:border-gold-primary transition-all duration-500 shadow-2xl">
                    {formData.photoURL || formData.photoBaseId ? (
                      <div className="relative w-full h-full">
                        <CheerioImage 
                          baseId={formData.photoBaseId}
                          fallbackUrl={formData.photoURL}
                          variant="avatar"
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'placeholder'}`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-gold-soft"><User size={60} /></div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={32} className="text-gold-primary" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept="image/*"
                  />
                  <div className="absolute bottom-2 right-2 p-3 bg-gold-primary text-theme-text-primary rounded-full shadow-xl">
                    <Camera size={20} />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-brown-primary uppercase tracking-[0.3em]">Update Portrait</span>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-brown-primary uppercase tracking-widest flex items-center gap-2">
                    <User size={12} /> Display Name
                  </label>
                  <input 
                    type="text"
                    required
                    className="w-full theme-cinematic-input border-b border-gold-soft/40 p-4 rounded-none text-xl serif text-brown-primary"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-brown-secondary uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} /> Ledger Email
                  </label>
                  <div className="w-full p-4 text-brown-secondary serif text-xl border-b border-gold-soft/20">
                    {user?.email}
                  </div>
                </div>

                {/* Year Selection (Students & Legends only) */}
                {formData.category !== "FACULTY" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-brown-primary uppercase tracking-widest flex items-center gap-2">
                      <GraduationCap size={12} /> Academic Year
                    </label>
                    <select 
                      className="w-full theme-cinematic-input border-b border-gold-soft/40 p-4 rounded-none text-xl serif text-brown-primary appearance-none"
                      value={formData.year}
                      onChange={e => setFormData({...formData, year: e.target.value})}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year (Legend)</option>
                    </select>
                  </div>
                )}

                {/* Section Selection (Students only) */}
                {formData.category === "STUDENT" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-brown-primary uppercase tracking-widest flex items-center gap-2">
                      <School size={12} /> Assigned Section
                    </label>
                    <select 
                      className="w-full theme-cinematic-input border-b border-gold-soft/40 p-4 rounded-none text-xl serif text-brown-primary appearance-none"
                      value={formData.section}
                      onChange={e => setFormData({...formData, section: e.target.value})}
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                    </select>
                  </div>
                )}

                {/* Role/Category Badge (Faculty/Legend only) */}
                {formData.category !== "STUDENT" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-brown-secondary uppercase tracking-widest flex items-center gap-2">
                      <Star size={12} /> Archival Status
                    </label>
                    <div className="w-full p-4 text-gold-primary font-bold serif text-xl border-b border-gold-soft/20 bg-card-tone rounded-xl">
                      {formData.category}
                    </div>
                  </div>
                )}
              </div>

              {/* Extended Profile Information */}
              <div className="space-y-8">
                {/* Role / Fun Fact */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-brown-primary uppercase tracking-widest flex items-center gap-2">
                    <Star size={12} /> Write something fun about yourself
                  </label>
                  <input 
                    type="text"
                    className="w-full theme-cinematic-input border-b border-gold-soft/40 p-4 rounded-none text-lg serif text-brown-primary"
                    placeholder="e.g. Code by day, gamer by night"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  />
                </div>

                {/* About Brief / Narrative */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-brown-primary uppercase tracking-widest flex items-center gap-2">
                    <Star size={12} /> About Brief
                  </label>
                  <textarea 
                    rows={3}
                    className="w-full theme-cinematic-input border border-gold-soft/40 p-4 rounded-xl text-lg serif text-brown-primary"
                    placeholder="A brief legacy note for the archives..."
                    value={formData.narrative}
                    onChange={e => setFormData({...formData, narrative: e.target.value})}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button 
                  type="submit"
                  disabled={saving}
                  className="theme-cinematic-btn-primary w-full py-6 rounded-2xl font-bold uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Forging Identity...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle size={20} className="text-black" />
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
