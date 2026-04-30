"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ReturnToDashboard } from "@/components/Sidebar";
import { GraduationCap, BookOpen, Star, Loader2 } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import Image from "next/image";
import OrganizerProfileModal, {
  type OrganizerData,
} from "@/components/OrganizerProfileModal";

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
  order?: number;
}

/** Map a Firestore Person into the separated OrganizerData shape */
function toOrganizerData(member: Person): OrganizerData {
  return {
    image: {
      src: member.imageURL || "",
      alt: member.name,
    },
    details: {
      name: member.name,
      role: member.role,
      quote: member.description,
      bio: "",
      social: {
        instagram: member.instagram,
        facebook: member.facebook,
        linkedin: member.linkedin,
        github: member.github,
      },
      status: "Academic Excellence",
      specialization: "Active Guardian",
    },
  };
}

export default function FacultyPage() {
  const [members, setMembers] = useState<Person[]>([]);
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

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
        category: doc.data().category,
        instagram: doc.data().instagram,
        facebook: doc.data().facebook,
        github: doc.data().github,
        linkedin: doc.data().linkedin,
        createdAt: doc.data().createdAt || "",
        order: doc.data().order
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
        category: doc.data().category,
        instagram: doc.data().instagram,
        facebook: doc.data().facebook,
        github: doc.data().github,
        linkedin: doc.data().linkedin,
        createdAt: doc.data().createdAt || "",
        order: doc.data().order
      })) as Person[];
      combineAndSet();
    });

    const combineAndSet = () => {
      const combined = [...peopleData, ...usersData];
      // Remove duplicates by ID if any
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      
      // Sort by custom order if set, otherwise fall back to createdAt
      const sorted = unique.sort((a, b) => {
        const aOrder = a.order ?? Infinity;
        const bOrder = b.order ?? Infinity;
        if (aOrder !== Infinity || bOrder !== Infinity) return aOrder - bOrder;
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase border border-amber-500/20">
            <GraduationCap size={14} /> The Pillars of Wisdom
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-brown-primary serif">The Mentors.</h1>
          <p className="text-brown-secondary italic serif text-lg max-w-2xl mx-auto">
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
          <div className="space-y-16">
            {/* Hero Group Photo */}
            <div className="relative aspect-[16/9] w-full rounded-[3rem] overflow-hidden border border-amber-500/20 shadow-2xl group">
              <Image 
                src="/assets/faculty_group.jpg" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Faculty Group" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-parchment-base/80 via-transparent to-transparent flex flex-col justify-end p-12">
                <p className="text-amber-500 font-bold uppercase tracking-[0.3em] text-xs">The Mentors</p>
                <h2 className="text-4xl font-bold text-brown-primary serif mt-2">Guiding the 2026 Vision.</h2>
              </div>
            </div>

            <div className="space-y-12">
              {/* ---- Faculty Card Grid (PRESERVED) ---- */}
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
                  <div className="relative aspect-square rounded-full overflow-hidden border-4 border-amber-500/10 transition-all duration-700 group-hover:scale-105 group-hover:shadow-[0_0_80px_rgba(245,158,11,0.15)] group-hover:border-amber-500/40 cursor-pointer bg-zinc-900">
                    {member.imageURL ? (
                      <Image 
                        src={member.imageURL} 
                        alt={member.name}
                        fill
                        className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000"
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
                    <div className="absolute inset-0 bg-parchment-base/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-8 text-center">
                      <BookOpen size={32} className="text-gold-primary/40 mx-auto mb-4" />
                      <p className="text-sm text-brown-primary italic serif mb-4 line-clamp-3">
                        &quot;{member.description}&quot;
                      </p>
                      <Star size={16} className="text-amber-600 mx-auto" />
                    </div>
                  </div>

                  {/* Bottom Label */}
                  <div className="mt-8 text-center space-y-2">
                    <h3 className="text-2xl font-bold text-brown-primary serif tracking-tight">{member.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-brown-secondary/60 text-[10px] font-bold uppercase tracking-[0.2em]">
                      <GraduationCap size={12} />
                      {member.role}
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

      {/* ============================================ */}
      {/* NEW Modal — OrganizerProfileModal component  */}
      {/* ============================================ */}
      {selectedMember && (
        <OrganizerProfileModal
          organizer={toOrganizerData(selectedMember)}
          onClose={() => setSelectedMember(null)}
          actionLabel="Distinguished Mentor"
        />
      )}
    </main>
  );
}
