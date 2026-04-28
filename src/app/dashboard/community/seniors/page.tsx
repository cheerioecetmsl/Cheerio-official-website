"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ReturnToDashboard } from "@/components/Sidebar";
import { X, Heart, Award, Quote, Sparkles, Loader2 } from "lucide-react";
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

export default function SeniorsPage() {
  const [members, setMembers] = useState<Person[]>([]);
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    // Query both "people" collection and "users" collection
    const qPeople = query(collection(db, "people"), where("category", "==", "LEGEND"));
    const qUsers = query(collection(db, "users"), where("category", "==", "LEGEND"), where("status", "==", "approved"));

    let peopleData: Person[] = [];
    let usersData: Person[] = [];

    const unsubscribePeople = onSnapshot(qPeople, (snapshot) => {
      peopleData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name,
        role: doc.data().role,
        description: doc.data().description || doc.data().narrative,
        imageURL: doc.data().imageURL || doc.data().photoURL,
        category: doc.data().category,
        instagram: doc.data().instagram,
        facebook: doc.data().facebook,
        github: doc.data().github,
        linkedin: doc.data().linkedin,
        createdAt: doc.data().createdAt || ""
      })) as Person[];
      combineAndSet();
    });

    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      usersData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name,
        role: doc.data().role || "Class of 2026 Legend",
        description: doc.data().narrative || doc.data().description,
        imageURL: doc.data().photoURL || doc.data().imageURL,
        category: doc.data().category,
        instagram: doc.data().instagram,
        facebook: doc.data().facebook,
        github: doc.data().github,
        linkedin: doc.data().linkedin,
        createdAt: doc.data().createdAt || ""
      })) as Person[];
      combineAndSet();
    });

    const combineAndSet = () => {
      const combined = [...peopleData, ...usersData];
      // Remove duplicates by ID if any
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      
      // Sort chronologically: First uploaded first shown
      const sorted = unique.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return a.createdAt.localeCompare(b.createdAt);
      });

      setMembers(sorted);
      setLoading(false);
    };

    return () => {
      unsubscribePeople();
      unsubscribeUsers();
    };
  }, []);

  return (
    <main className="min-h-screen py-24 px-8">
      <ReturnToDashboard />
      
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-soft/20 rounded-full text-gold-primary text-[10px] font-bold tracking-[0.3em] uppercase">
            <Sparkles size={14} /> The Class of Distinction
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-brown-primary serif">Our Legends.</h1>
          <p className="text-brown-secondary italic serif text-lg max-w-2xl mx-auto">
            Honoring the legends of the Batch of 2026. Their legacy is our foundation.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <Loader2 className="w-16 h-16 text-gold-primary animate-spin" />
            <p className="text-brown-secondary font-bold uppercase tracking-widest text-xs animate-pulse">Consulting the Archives...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-gold/10 rounded-[3rem]">
            <p className="text-brown-secondary/60 font-bold uppercase tracking-widest text-sm italic serif">The Elders are currently silent.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Hero Group Photo */}
            <div className="relative aspect-[16/9] w-full rounded-[3rem] overflow-hidden border border-gold/20 shadow-2xl group">
              <Image 
                src="/assets/legends_group.jpg" 
                fill 
                sizes="(max-width: 768px) 100vw, 100vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Legends Group" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-parchment-base/80 via-transparent to-transparent flex flex-col justify-end p-12">
                <p className="text-gold-primary font-bold uppercase tracking-[0.3em] text-xs">The Legends</p>
                <h2 className="text-4xl font-bold text-brown-primary serif mt-2">Class of 2026 Legends.</h2>
              </div>
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {members
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((member) => (
                <div 
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="group relative"
                >
                  {/* Profile Card */}
                  <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-gold/10 transition-all duration-700 group-hover:scale-105 group-hover:shadow-[0_0_80px_rgba(212,175,55,0.15)] group-hover:border-gold/40 cursor-pointer bg-zinc-900">
                    {member.imageURL ? (
                      <Image 
                        src={member.imageURL} 
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-zinc-800 uppercase">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-parchment-base/95 via-parchment-base/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-center">
                      <Quote size={24} className="text-gold-primary/40 mx-auto mb-4" />
                      <p className="text-sm text-brown-secondary/80 italic serif mb-6 line-clamp-3 leading-relaxed">
                        &quot;{member.description}&quot;
                      </p>
                      <div className="h-px w-12 bg-gold-primary/40 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-brown-primary serif tracking-widest uppercase">{member.name}</h3>
                    </div>
                  </div>

                  {/* Bottom Label (Visible always) */}
                  <div className="mt-8 text-center space-y-2 group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="text-xl font-bold text-brown-primary serif tracking-widest uppercase">{member.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-brown-secondary text-[10px] font-bold uppercase tracking-[0.2em]">
                      <Award size={12} />
                      {member.role || "Class of 2026"}
                    </div>
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
          </div>
        )}
      </div>

      {/* Senior Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div 
            className="absolute inset-0 bg-parchment-base/95 backdrop-blur-3xl"
            onClick={() => setSelectedMember(null)}
          />
          
          <div className="relative glass-card max-w-5xl w-full rounded-[2rem] md:rounded-[4rem] border-gold-primary/20 overflow-hidden animate-in zoom-in fade-in duration-700 flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-none md:h-[75vh] lg:h-[80vh]">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 md:p-4 bg-gold-primary text-black rounded-full z-10 hover:scale-110 transition-transform shadow-2xl"
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>

            <div className="w-full md:w-2/5 h-[40%] md:h-full relative bg-zinc-900 flex-shrink-0">
              {selectedMember.imageURL ? (
                <Image 
                  src={selectedMember.imageURL} 
                  alt={selectedMember.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
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
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-bg/10 hidden md:block pointer-events-none" />
            </div>

            <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-16 flex-1 min-h-0 flex flex-col justify-start md:justify-center space-y-6 md:space-y-8 lg:space-y-10 overflow-y-auto bg-card-tone">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-gold-primary font-bold uppercase tracking-[0.4em] text-[10px]">
                  <Award size={14} /> Distinguished Legend
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-brown-primary serif leading-tight break-words">
                  {selectedMember.name}
                </h2>
                <p className="text-gold-primary font-bold uppercase tracking-widest text-[10px] md:text-xs">{selectedMember.role}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-grow bg-gold-primary/10" />
                  <Quote size={20} className="text-gold-primary/20 md:w-6 md:h-6" />
                  <div className="h-px flex-grow bg-gold-primary/10" />
                </div>
                <p className="text-lg md:text-xl text-brown-secondary/80 italic serif leading-relaxed text-center">
                  &quot;{selectedMember.description}&quot;
                </p>
                <div className="h-px w-full bg-gold-primary/10" />
              </div>

              <div className="pt-4 md:pt-8 flex flex-col items-center gap-6 pb-8 md:pb-0">
                {/* Social Links */}
                <div className="flex gap-6">
                  {selectedMember.instagram && (
                    <a href={selectedMember.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gold-primary/5 text-gold-primary rounded-2xl hover:bg-gold-primary hover:text-black transition-all">
                      <InstagramIcon size={20} />
                    </a>
                  )}
                  {selectedMember.facebook && (
                    <a href={selectedMember.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-gold-primary/5 text-gold-primary rounded-2xl hover:bg-gold-primary hover:text-black transition-all">
                      <FacebookIcon size={20} />
                    </a>
                  )}
                  {selectedMember.github && (
                    <a href={selectedMember.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gold-primary/5 text-gold-primary rounded-2xl hover:bg-gold-primary hover:text-black transition-all">
                      <GithubIcon size={20} />
                    </a>
                  )}
                  {selectedMember.linkedin && (
                    <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-gold-primary/5 text-gold-primary rounded-2xl hover:bg-gold-primary hover:text-black transition-all">
                      <LinkedinIcon size={20} />
                    </a>
                  )}
                </div>
                
                <div className="h-px w-24 bg-gold-primary/10" />
                
                <button className="flex items-center gap-3 px-8 py-4 bg-gold-primary/5 border border-gold-primary/10 text-gold-primary rounded-full hover:bg-gold-primary/10 transition-all font-bold uppercase tracking-widest text-[10px]">
                  <Heart size={16} /> Legacy Approved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
