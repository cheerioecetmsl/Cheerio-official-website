"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ReturnToDashboard } from "@/components/Sidebar";
import { UploadCloud, Check, AlertCircle, Sparkles, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddMemberPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    role: "organizer",
    department: "",
    bio: "",
    instagram: "",
    linkedin: ""
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.name || !formData.bio) {
      setError("Please fill all required fields and upload a photo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Upload to Cloudinary with dynamic folder routing
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "Cheerio-2026");
      // Route to organizers or seniors subfolder
      data.append("folder", `Cheerio/${formData.role}s`);

      const res = await fetch(`https://api.cloudinary.com/v1_1/dyvobdjp5/image/upload`, {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error("Upload failed");

      // 2. Save metadata to Firestore
      await addDoc(collection(db, "community"), {
        ...formData,
        photoUrl: resData.secure_url,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => router.push(`/dashboard/community/${formData.role}s`), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8">
      <ReturnToDashboard />
      
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full text-gold text-[10px] font-bold tracking-[0.3em] uppercase">
            <Sparkles size={14} /> Growing the Legacy
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-ink dark:text-gold serif text-glow">Enroll Member.</h1>
          <p className="text-ink/60 dark:text-dark-text/60 italic serif text-lg">
            Add a new visionary or legend to the Cheerio community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 md:p-16 rounded-[4rem] border-gold/10 space-y-12 shadow-2xl relative overflow-hidden">
          {/* Form Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] -mr-32 -mt-32" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Photo Upload Section */}
            <div className="space-y-6">
              <label className="text-gold font-bold uppercase tracking-widest text-[10px] block">
                Official Photo
              </label>
              <div className="relative group aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-dashed border-gold/20 hover:border-gold transition-all duration-500 bg-gold/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center space-y-4 p-8">
                    <UploadCloud size={48} className="text-gold/40 mx-auto group-hover:scale-110 transition-transform" />
                    <p className="text-gold/60 font-bold uppercase tracking-widest text-[10px]">
                      Drop portrait here or click to browse
                    </p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Fields Section */}
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-gold font-bold uppercase tracking-widest text-[10px] block">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-gold/5 border-b-2 border-gold/20 p-4 text-ink dark:text-white serif text-xl focus:border-gold outline-none transition-all placeholder:text-gold/20"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-gold font-bold uppercase tracking-widest text-[10px] block">Community Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, role: "organizer"})}
                    className={`py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all border ${
                      formData.role === "organizer" ? "bg-gold text-ink border-gold" : "bg-gold/5 text-gold border-gold/10 hover:border-gold/40"
                    }`}
                  >
                    Organizer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, role: "senior"})}
                    className={`py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all border ${
                      formData.role === "senior" ? "bg-gold text-ink border-gold" : "bg-gold/5 text-gold border-gold/10 hover:border-gold/40"
                    }`}
                  >
                    Senior
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gold font-bold uppercase tracking-widest text-[10px] block">Department / Branch</label>
                <input 
                  type="text" 
                  placeholder="e.g. Media Head or CSE"
                  className="w-full bg-gold/5 border-b-2 border-gold/20 p-4 text-ink dark:text-white serif text-xl focus:border-gold outline-none transition-all placeholder:text-gold/20"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-gold font-bold uppercase tracking-widest text-[10px] block">Social Footprints (Optional)</label>
                <div className="space-y-4">
                  <input 
                    type="url" 
                    placeholder="Instagram URL"
                    className="w-full bg-gold/5 border-b-2 border-gold/20 p-4 text-xs focus:border-gold outline-none transition-all"
                    value={formData.instagram}
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  />
                  <input 
                    type="url" 
                    placeholder="LinkedIn URL"
                    className="w-full bg-gold/5 border-b-2 border-gold/20 p-4 text-xs focus:border-gold outline-none transition-all"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gold font-bold uppercase tracking-widest text-[10px] block">The Bio / Legacy Message</label>
            <textarea 
              required
              rows={4}
              placeholder="Tell their story in a few sentences..."
              className="w-full bg-gold/5 border-b-2 border-gold/20 p-6 text-ink dark:text-white serif text-xl focus:border-gold outline-none transition-all resize-none placeholder:text-gold/20"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 text-green-500 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <Check size={20} />
              <p className="text-xs font-bold uppercase tracking-widest">Member archived successfully! Redirecting...</p>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-6 rounded-full font-bold uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-4 ${
              loading ? "bg-gold/40 cursor-wait" : "bg-gold text-ink hover:scale-[1.02] active:scale-95 shadow-[0_20px_50px_rgba(212,175,55,0.3)]"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={20} /> Enroll into Legacy
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
