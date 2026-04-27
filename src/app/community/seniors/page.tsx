"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { DirectoryHeader, ProfileCard, ArchiveProfile } from "@/components/CommunityModules";

export default function SeniorsPage() {
  const [seniors, setSeniors] = useState<ArchiveProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users"), 
      where("category", "==", "LEGEND"),
      where("status", "==", "approved")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSeniors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArchiveProfile)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-parchment-base py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <DirectoryHeader 
          title="The Hall of Legends" 
          description="Honoring the Class of 2026 who paved the way for our shared legacy." 
        />
        
        {loading ? (
          <div className="p-20 text-center text-brown-secondary/20 animate-pulse serif italic text-2xl">Consulting the Archives...</div>
        ) : seniors.length === 0 ? (
          <div className="p-20 text-center text-brown-secondary/20 serif italic text-xl">The Hall of Legends is silent... awaiting induction.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {seniors.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
