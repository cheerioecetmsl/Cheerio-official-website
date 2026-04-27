"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ReturnToDashboard } from "@/components/Sidebar";
import { X, Camera, ExternalLink, Mail, Sparkles, Loader2 } from "lucide-react";
import { InstagramIcon, FacebookIcon, GithubIcon, LinkedinIcon } from "@/components/SocialIcons";
import Image from "next/image";

interface Person {
  id: string;
  name: string;
  role: string;
  description: string;
  imageURL?: string;
  category: string;
  instagram?: string;
  facebook?: string;
  github?: string;
  linkedin?: string;
}

export default function OrganizersPage() {
  const [members, setMembers] = useState<Person[]>([]);
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "people"), where("category", "==", "COUNCIL"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        instagram: doc.data().instagram,
        facebook: doc.data().facebook,
        github: doc.data().github,
        linkedin: doc.data().linkedin
      })) as Person[];
      setMembers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen py-24 px-8">
      <ReturnToDashboard />
      
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full text-gold text-[10px] font-bold tracking-[0.3em] uppercase">
            <Sparkles size={14} /> The Architects of 2026
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-brown-primary serif">The Council.</h1>
          <p className="text-brown-secondary italic serif text-lg max-w-2xl mx-auto">
            Meet the visionaries who are reconstructing our story, frame by frame.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <Loader2 className="w-16 h-16 text-gold animate-spin" />
            <p className="text-gold font-bold uppercase tracking-widest text-xs animate-pulse">Summoning the Council...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-gold/10 rounded-[3rem]">
            <p className="text-gold/40 font-bold uppercase tracking-widest text-sm italic serif">The Council is currently in the shadows.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {members.map((member) => (
              <div 
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="group relative glass-card p-4 rounded-[2.5rem] border-gold/10 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(212,175,55,0.2)] hover:border-gold/40"
              >
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative shadow-2xl bg-zinc-900">
                  {member.imageURL ? (
                    <Image 
                      src={member.imageURL} 
                      alt={member.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-800">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-parchment-base/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <p className="text-gold-primary font-bold uppercase tracking-widest text-[10px] mb-1">Council Member</p>
                    <h3 className="text-xl font-bold text-brown-primary serif">{member.name}</h3>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-lg font-bold text-brown-primary uppercase tracking-widest">{member.name}</h3>
                  <p className="text-[10px] text-brown-secondary/40 font-bold uppercase tracking-widest mt-1">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div 
            className="absolute inset-0 bg-parchment-base/95 backdrop-blur-2xl"
            onClick={() => setSelectedMember(null)}
          />
          
          <div className="relative glass-card max-w-4xl w-full rounded-[3rem] border-gold-primary/20 overflow-hidden animate-in zoom-in fade-in duration-500 flex flex-col md:flex-row h-full max-h-[80vh] md:h-auto bg-card-tone">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-6 right-6 p-3 bg-gold-primary text-black rounded-full z-10 hover:scale-110 transition-transform"
            >
              <X size={24} />
            </button>

            <div className="w-full md:w-1/2 h-64 md:h-auto bg-zinc-900">
              {selectedMember.imageURL ? (
                <Image 
                  src={selectedMember.imageURL} 
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.id}`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-zinc-800">
                  {selectedMember.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center space-y-8 overflow-y-auto">
              <div className="space-y-4">
                <span className="text-gold-primary font-bold uppercase tracking-[0.4em] text-[10px] block">
                  The Council
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-brown-primary serif leading-tight">
                  {selectedMember.name}
                </h2>
                <p className="text-gold-primary font-bold uppercase tracking-widest text-[10px]">{selectedMember.role}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-gold-primary/40 font-bold uppercase tracking-widest text-[10px]">The Legacy</h4>
                <p className="text-brown-secondary/60 italic serif text-lg leading-relaxed">
                  &quot;{selectedMember.description}&quot;
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                {selectedMember.instagram && (
                  <a href={selectedMember.instagram} target="_blank" rel="noopener noreferrer" className="p-4 bg-gold-primary/5 text-gold-primary rounded-2xl hover:bg-gold-primary hover:text-black transition-all">
                    <InstagramIcon size={20} />
                  </a>
                )}
                {selectedMember.facebook && (
                  <a href={selectedMember.facebook} target="_blank" rel="noopener noreferrer" className="p-4 bg-gold-primary/5 text-gold-primary rounded-2xl hover:bg-gold-primary hover:text-black transition-all">
                    <FacebookIcon size={20} />
                  </a>
                )}
                {selectedMember.github && (
                  <a href={selectedMember.github} target="_blank" rel="noopener noreferrer" className="p-4 bg-gold-primary/5 text-gold-primary rounded-2xl hover:bg-gold-primary hover:text-black transition-all">
                    <GithubIcon size={20} />
                  </a>
                )}
                {selectedMember.linkedin && (
                  <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 bg-gold-primary/5 text-gold-primary rounded-2xl hover:bg-gold-primary hover:text-black transition-all">
                    <LinkedinIcon size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
