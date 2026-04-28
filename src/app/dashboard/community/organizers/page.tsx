"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ReturnToDashboard } from "@/components/Sidebar";
import { X, Camera, ExternalLink, Mail, Sparkles, Loader2 } from "lucide-react";
import { Pagination } from "@/components/Pagination";
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
  createdAt?: string;
}

export default function OrganizersPage() {
  const [members, setMembers] = useState<Person[]>([]);
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const q = query(collection(db, "people"), where("category", "==", "COUNCIL"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name,
        role: doc.data().role,
        description: doc.data().description || doc.data().narrative || "",
        imageURL: doc.data().imageURL || doc.data().photoURL || "",
        category: doc.data().category,
        instagram: doc.data().instagram,
        facebook: doc.data().facebook,
        github: doc.data().github,
        linkedin: doc.data().linkedin,
        createdAt: doc.data().createdAt || ""
      })) as Person[];
      
      // Sort chronologically: First uploaded first shown
      // Note: Documents missing 'createdAt' will be sorted to the end
      const sortedData = data.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return a.createdAt.localeCompare(b.createdAt);
      });

      setMembers(sortedData);
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
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {members
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((member) => (
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

            {/* Pagination Controls */}
            <Pagination 
              currentPage={currentPage}
              totalPages={Math.ceil(members.length / ITEMS_PER_PAGE)}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
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
          
          <div className="relative glass-card max-w-5xl w-full rounded-[4rem] border-gold-primary/20 overflow-hidden animate-in zoom-in fade-in duration-700 flex flex-col md:flex-row h-full max-h-[85vh] md:h-auto bg-card-tone">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-8 right-8 p-4 bg-gold-primary text-black rounded-full z-10 hover:scale-110 transition-transform shadow-2xl"
            >
              <X size={24} />
            </button>

            <div className="w-full md:w-2/5 h-80 md:h-auto relative bg-zinc-900">
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
                <div className="w-full h-full flex items-center justify-center text-8xl font-bold text-zinc-800">
                  {selectedMember.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="w-full md:w-3/5 p-12 md:p-20 flex flex-col justify-center space-y-12 overflow-y-auto">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-gold-primary font-bold uppercase tracking-[0.4em] text-[10px]">
                  <Sparkles size={14} /> The Architect
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-brown-primary serif leading-tight">
                  {selectedMember.name}
                </h2>
                <p className="text-gold-primary font-bold uppercase tracking-widest text-xs">{selectedMember.role}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-grow bg-gold-primary/10" />
                  <span className="text-gold-primary/20 italic serif text-sm">Vision</span>
                  <div className="h-px flex-grow bg-gold-primary/10" />
                </div>
                <p className="text-xl md:text-2xl text-brown-secondary/80 italic serif leading-relaxed text-center">
                  &quot;{selectedMember.description}&quot;
                </p>
                <div className="h-px w-full bg-gold-primary/10" />
              </div>

              <div className="pt-8 flex flex-col items-center gap-8">
                <div className="flex gap-6">
                  {selectedMember.instagram && (
                    <a href={selectedMember.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gold-primary/10 text-gold-primary rounded-full hover:bg-gold-primary hover:text-black transition-all">
                      <InstagramIcon size={20} />
                    </a>
                  )}
                  {selectedMember.facebook && (
                    <a href={selectedMember.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-gold-primary/10 text-gold-primary rounded-full hover:bg-gold-primary hover:text-black transition-all">
                      <FacebookIcon size={20} />
                    </a>
                  )}
                  {selectedMember.github && (
                    <a href={selectedMember.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gold-primary/10 text-gold-primary rounded-full hover:bg-gold-primary hover:text-black transition-all">
                      <GithubIcon size={20} />
                    </a>
                  )}
                  {selectedMember.linkedin && (
                    <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-gold-primary/10 text-gold-primary rounded-full hover:bg-gold-primary hover:text-black transition-all">
                      <LinkedinIcon size={20} />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gold-primary/40 uppercase tracking-widest">Council Status</p>
                    <p className="text-sm font-bold text-brown-secondary/60 uppercase tracking-widest">Vision Lead</p>
                  </div>
                  <div className="h-12 w-px bg-gold-primary/10" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gold-primary/40 uppercase tracking-widest">Specialization</p>
                    <p className="text-sm font-bold text-brown-secondary/60 uppercase tracking-widest">Master Architect</p>
                  </div>
                </div>

                <div className="h-px w-24 bg-gold-primary/10" />

                <button className="flex items-center gap-3 px-8 py-4 bg-gold-primary/5 border border-gold-primary/10 text-gold-primary rounded-full hover:bg-gold-primary/10 transition-all font-bold uppercase tracking-widest text-[10px]">
                  <Sparkles size={16} /> Approved Architect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
