"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { MessageSquare, Send, Heart, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  color: string;
  likes: number;
  createdAt: any;
}

const COLORS = [
  "bg-[#FDF6E3]", // Parchment
  "bg-[#E8DCC4]", // Aged Paper
  "bg-[#F5E6D3]", // Soft Cream
  "bg-[#EFE9D5]", // Sage Tint
  "bg-[#F9F1E7]", // Ivory
];

export default function AnonymousWallPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "anonymous_messages"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      await addDoc(collection(db, "anonymous_messages"), {
        content: newMessage,
        color,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error posting message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A1A] text-parchment p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gold-soft hover:text-gold-primary transition-colors uppercase tracking-widest text-[10px] font-bold">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold serif italic text-gold-primary leading-tight">
              The Whisper <br/> Gallery
            </h1>
            <p className="text-zinc-400 serif italic text-lg max-w-md">
              A safe haven for unspoken words. Share your memories, confessions, or gratitude anonymously.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full md:w-[400px] space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="What's on your mind, Archivist?"
              maxLength={280}
              className="w-full h-32 bg-transparent border-none text-parchment placeholder:text-zinc-600 resize-none focus:ring-0 text-lg serif italic"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{newMessage.length} / 280</span>
              <button 
                type="submit"
                disabled={!newMessage.trim() || isSubmitting}
                className="flex items-center gap-2 bg-gold-primary text-black font-bold px-6 py-3 rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-gold-primary/20 hover:scale-105 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Whispering..." : "Release" } <Send size={12} />
              </button>
            </div>
          </form>
        </div>

        {/* Masonry Layout with CSS Columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`break-inside-avoid p-8 rounded-[2rem] ${msg.color} text-brown-primary shadow-2xl transition-all duration-500 hover:-rotate-1 hover:scale-[1.02] cursor-default group relative overflow-hidden`}
            >
               {/* Decorative Sparkle */}
               <Sparkles className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity" size={20} />
               
               <p className="text-xl md:text-2xl serif italic leading-relaxed mb-8">
                 &quot;{msg.content}&quot;
               </p>

               <div className="flex items-center justify-between border-t border-brown-primary/10 pt-4">
                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                   {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                 </span>
                 <button className="flex items-center gap-1 text-brown-primary/40 hover:text-red-500 transition-colors group/btn">
                    <Heart size={14} className="group-hover/btn:fill-red-500 transition-all" />
                    <span className="text-[10px] font-bold tabular-nums">{msg.likes || 0}</span>
                 </button>
               </div>
            </div>
          ))}
        </div>

        {messages.length === 0 && (
          <div className="text-center py-40">
             <MessageSquare className="mx-auto text-zinc-800 mb-6" size={64} />
             <p className="text-zinc-600 serif italic text-xl">The air is still. Be the first to whisper.</p>
          </div>
        )}
      </div>
    </main>
  );
}
