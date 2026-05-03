"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { CommunityChat } from "@/components/chat/CommunityChat";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#050505]">
      {/* Navigation Bar */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-[#0A0A0A]">
        <Link 
          href="/dashboard"
          className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-500" />
          <h1 className="text-lg font-bold text-white tracking-tight">Community Chat</h1>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        {user ? (
          <CommunityChat currentUser={user} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-white/20 font-medium">Authenticating...</div>
          </div>
        )}
      </div>
    </div>
  );
}
