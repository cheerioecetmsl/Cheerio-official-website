"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ReturnToDashboard } from "@/components/Sidebar";
import { X, GraduationCap, Quote, Sparkles, Loader2, BookOpen, Star } from "lucide-react";

interface Person {
  id: string;
  name: string;
  role: string;
  description: string;
  imageURL?: string;
  category: string;
}

export default function FacultyPage() {
  const [members, setMembers] = useState<Person[]>([]);
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query both "people" collection and "users" collection
    const qPeople = query(collection(db, "people"), where("category", "==", "FACULTY"));
    const qUsers = query(collection(db, "users"), where("category", "==", "FACULTY"), where("status", "==", "approved"));

    let peopleData: Person[] = [];
    let usersData: Person[] = [];

    const unsubscribePeople = onSnapshot(qPeople, (snapshot) => {
      peopleData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name,
        role: doc.data().role,
        description: doc.data().description || doc.data().narrative,
        imageURL: doc.data().imageURL || doc.data().photoURL,
        category: doc.data().category
      })) as Person[];
      combineAndSet();
    });

    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      usersData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name,
        role: doc.data().role || "Esteemed Faculty",
        description: doc.data().narrative || doc.data().description,
        imageURL: doc.data().photoURL || doc.data().imageURL,
        category: doc.data().category
      })) as Person[];
      combineAndSet();
    });

    const combineAndSet = () => {
      const combined = [...peopleData, ...usersData];
      // Remove duplicates by ID if any
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      setMembers(unique);
      setLoading(false);
    };

    return () => {
      unsubscribePeople();
      unsubscribeUsers();
    };
  }, []);

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8">
      <ReturnToDashboard />
      
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase border border-amber-500/20">
            <GraduationCap size={14} /> The Pillars of Wisdom
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-ink dark:text-gold serif">The Mentors.</h1>
          <p className="text-ink/60 dark:text-dark-text/60 italic serif text-lg max-w-2xl mx-auto">
            Honoring the faculty and mentors who guided our journey with knowledge and grace.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
            <p className="text-amber-500 font-bold uppercase tracking-widest text-xs animate-pulse">Summoning the Mentors...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-amber-500/10 rounded-[3rem]">
            <p className="text-amber-500/40 font-bold uppercase tracking-widest text-sm italic serif">The Mentors are currently in the library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pt-8">
            {members.map((member) => (
              <div 
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="group relative"
              >
                {/* Profile Card */}
                <div className="relative aspect-square rounded-full overflow-hidden border-4 border-amber-500/10 transition-all duration-700 group-hover:scale-105 group-hover:shadow-[0_0_80px_rgba(245,158,11,0.15)] group-hover:border-amber-500/40 cursor-pointer bg-zinc-900">
                  {member.imageURL ? (
                    <img 
                      src={member.imageURL} 
                      alt={member.name}
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-zinc-800 uppercase">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-amber-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-8 text-center">
                    <BookOpen size={32} className="text-gold/40 mx-auto mb-4" />
                    <p className="text-sm text-white italic serif mb-4 line-clamp-3">
                      "{member.description}"
                    </p>
                    <Star size={16} className="text-amber-500 mx-auto" />
                  </div>
                </div>

                {/* Bottom Label */}
                <div className="mt-8 text-center space-y-2">
                  <h3 className="text-2xl font-bold text-ink dark:text-gold serif tracking-tight">{member.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-amber-500/60 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <GraduationCap size={12} />
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mentor Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
            onClick={() => setSelectedMember(null)}
          />
          
          <div className="relative glass-card max-w-5xl w-full rounded-[4rem] border-amber-500/20 overflow-hidden animate-in zoom-in fade-in duration-700 flex flex-col md:flex-row h-full max-h-[85vh] md:h-auto">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-8 right-8 p-4 bg-amber-500 text-ink rounded-full z-10 hover:scale-110 transition-transform shadow-2xl"
            >
              <X size={24} />
            </button>

            <div className="w-full md:w-2/5 h-80 md:h-auto relative bg-zinc-900">
              {selectedMember.imageURL ? (
                <img 
                  src={selectedMember.imageURL} 
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl font-bold text-zinc-800">
                  {selectedMember.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="w-full md:w-3/5 p-12 md:p-20 flex flex-col justify-center space-y-12 overflow-y-auto">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-amber-500 font-bold uppercase tracking-[0.4em] text-[10px]">
                  <GraduationCap size={14} /> Distinguished Mentor
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-ink dark:text-gold serif leading-tight">
                  {selectedMember.name}
                </h2>
                <p className="text-amber-500 font-bold uppercase tracking-widest text-xs">{selectedMember.role}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-grow bg-amber-500/10" />
                  <Quote size={24} className="text-amber-500/20" />
                  <div className="h-px flex-grow bg-amber-500/10" />
                </div>
                <p className="text-xl md:text-2xl text-ink/80 dark:text-dark-text/80 italic serif leading-relaxed text-center">
                  "{selectedMember.description}"
                </p>
                <div className="h-px w-full bg-amber-500/10" />
              </div>

              <div className="pt-8 flex justify-center">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-amber-500/40 uppercase tracking-widest">Legacy Contribution</p>
                    <p className="text-sm font-bold text-ink/60 dark:text-dark-text/60 uppercase tracking-widest">Academic Excellence</p>
                  </div>
                  <div className="h-12 w-px bg-amber-500/10" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-amber-500/40 uppercase tracking-widest">Mentor Status</p>
                    <p className="text-sm font-bold text-ink/60 dark:text-dark-text/60 uppercase tracking-widest">Active Guardian</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
