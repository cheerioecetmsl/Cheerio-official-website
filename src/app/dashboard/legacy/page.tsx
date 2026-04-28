"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { ReturnToDashboard } from "@/components/Sidebar";
import { School, History, Sparkles, BookOpen, Quote, X, Maximize2, Target, Compass, CheckCircle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface LegacyItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  imageURL: string;
  createdAt: any;
}

export default function LegacyPage() {
  const [items, setItems] = useState<LegacyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<LegacyItem | null>(null);

  useEffect(() => {
    const fetchLegacy = async () => {
      try {
        const q = query(collection(db, "legacy_content"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LegacyItem));
        setItems(data);
      } catch (err) {
        console.error("Fetch Legacy Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLegacy();
  }, []);

  return (
    <main className="min-h-screen py-24 px-8 overflow-hidden relative">
      <ReturnToDashboard />
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-12 md:space-y-24 relative z-10">
        
        {/* Cinematic Header */}
        <div className="text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 bg-card-tone border border-gold-soft/30 rounded-full text-brown-primary text-[8px] md:text-[10px] font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles size={12} /> The Eternal Ledger
          </div>
          <h1 className="text-5xl md:text-9xl font-bold text-brown-primary serif tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Our Legacy.
          </h1>
        </div>

        {/* Feature Image - PRESERVED AS REQUESTED WITH MOBILE OPTIMIZATION */}
        <div className="relative aspect-[16/10] md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-gold/20 shadow-2xl group mx-4 md:mx-0">
          <Image 
            src="/assets/department_hero_image.png" 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-105" 
            alt="Department History" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-parchment-base/90 via-parchment-base/10 to-transparent flex flex-col justify-end p-6 md:p-12">
            <p className="text-brown-primary font-bold uppercase tracking-[0.3em] text-[8px] md:text-xs">Foundation Archive</p>
            <h2 className="text-2xl md:text-4xl font-bold text-black serif mt-2 leading-tight">The Genesis of Excellence</h2>
          </div>
        </div>

        {/* Institution and Department Description Sections */}
        <div className="space-y-12 md:space-y-16">
          {/* About College */}
          <div className="theme-card p-8 md:p-12 rounded-[2.5rem] border border-gold-soft/20 shadow-xl space-y-10 bg-card-tone relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-primary/10 transition-colors duration-700" />
            
            <div className="relative z-10 flex items-center gap-4 border-b border-gold-soft/20 pb-6">
              <div className="p-3 bg-gold-soft/10 rounded-2xl border border-gold-soft/20 text-brown-primary shadow-inner">
                <School size={32} />
              </div>
              <h3 className="text-3xl md:text-5xl font-bold text-brown-primary serif">Techno Main Salt Lake</h3>
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="text-lg md:text-xl text-brown-primary/90 serif leading-relaxed md:leading-loose text-justify">
                <p className="first-letter:text-6xl first-letter:font-bold first-letter:text-gold-primary first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                  <span className="font-bold text-brown-primary">Ever since its inception</span>, Techno Main Salt Lake has earned its rightful place in the field of academics. Established in the year <span className="text-gold-primary font-bold">2001</span>, this nationally acclaimed institute has set itself apart from other educational organizations by virtue of its visionary objectives and novel endeavors. 
                </p>
                <p className="mt-6">
                  Situated in the heart of the city of joy, <span className="font-bold text-brown-primary">Techno Main Salt Lake</span> has grown in leaps and bounds over the glorious past <span className="text-gold-primary font-bold">25 years</span> with its growing emphasis on research infrastructure, hands-on-training opportunities and holistic skill development in aspirants. This institute encourages its students to thrive in an academic albeit wholesome ambience that paves the way for skilled human resources in the future. Faculty development programs, soft skill development initiatives coupled with a multitude of seminars and workshops constitute the highlights of the academic initiatives undertaken here.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-gradient-to-br from-parchment-base/80 to-transparent p-8 rounded-[2rem] border border-gold-soft/20 shadow-inner group/vision hover:border-gold-primary/40 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Compass size={24} className="text-gold-primary group-hover/vision:animate-spin-slow" />
                    <h4 className="text-xl font-bold text-brown-primary uppercase tracking-[0.2em]">Institute Vision</h4>
                  </div>
                  <p className="italic text-brown-secondary serif leading-relaxed">
                    &quot;Emerge as a Centre of excellence for engineering and management studies encouraging research and building leaders contributing towards individual and social empowerment.&quot;
                  </p>
                </div>

                <div className="bg-gradient-to-br from-parchment-base/80 to-transparent p-8 rounded-[2rem] border border-gold-soft/20 shadow-inner group/mission hover:border-gold-primary/40 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Target size={24} className="text-gold-primary group-hover/mission:scale-110 transition-transform" />
                    <h4 className="text-xl font-bold text-brown-primary uppercase tracking-[0.2em]">Institute Mission</h4>
                  </div>
                  <ul className="space-y-4 text-brown-secondary serif leading-relaxed">
                    <li className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-gold-primary/60 mt-1 shrink-0" />
                      <span>Identify individual potential, capabilities and skills to achieve confidence and competence.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-gold-primary/60 mt-1 shrink-0" />
                      <span>Practice innovative and modern methods of pedagogy encouraging holistic education and research.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-gold-primary/60 mt-1 shrink-0" />
                      <span>Enhance employability skills through collaborative ventures with the industry.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-gold-primary/60 mt-1 shrink-0" />
                      <span>Build leaders and entrepreneurs with integrity and ethics fostering growth and sustainability.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* About Department */}
          <div className="theme-card p-8 md:p-12 rounded-[2.5rem] border border-gold-soft/20 shadow-xl space-y-10 bg-card-tone relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 group-hover:bg-gold-primary/10 transition-colors duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 border-b border-gold-soft/20 pb-6">
              <div className="p-3 bg-gold-soft/10 rounded-2xl border border-gold-soft/20 text-brown-primary w-fit shadow-inner">
                <BookOpen size={32} />
              </div>
              <h3 className="text-3xl md:text-5xl font-bold text-brown-primary serif leading-tight">Electronics & Communication Engineering</h3>
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="text-lg md:text-xl text-brown-primary/90 serif leading-relaxed md:leading-loose text-justify">
                <p className="first-letter:text-6xl first-letter:font-bold first-letter:text-gold-primary first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                  <span className="font-bold text-brown-primary">The department</span> of Electronics and Communication Engineering is approved by the <span className="font-bold text-brown-primary">AICTE</span>, accredited by <span className="font-bold text-brown-primary">NBA</span>, and is affiliated to <span className="font-bold text-brown-primary">MAKAUT</span>. Established in 2001, offering a B.Tech. course to 60 students initially and gradually increasing the intake to 120 students by 2007-2008. The department proudly introduced an M.Tech program in VLSI and Microelectronics in 2006-2007.
                </p>
                <div className="my-8 py-8 px-8 md:px-10 border-l-4 border-gold-primary bg-gradient-to-r from-gold-soft/10 to-transparent rounded-r-3xl">
                  <Quote className="text-gold-primary/40 mb-4" size={32} />
                  <p className="italic text-brown-primary font-medium text-xl md:text-2xl leading-relaxed">
                    &quot;The department provides an intellectually stimulating environment that encourages innovative thinking, creative problem-solving, and enthusiastic learning. With a dedicated faculty network, well-equipped labs, and skill-based programs, students are prepared for industry demands.&quot;
                  </p>
                </div>
                <p className="mt-6">
                  While teaching is a priority, research and consultancy also receive attention here, under different professional student chapters like <span className="font-bold text-gold-primary">IET</span> and <span className="font-bold text-gold-primary">IETE</span> offering their memberships to the students. The department fosters a student-friendly atmosphere, promoting collaboration and maintaining a professional culture. Through projects, seminars, lectures, meetings, and festivals, they aim for efficient and proficient results, enabling students to compete globally.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-gradient-to-br from-parchment-base/80 to-transparent p-8 rounded-[2rem] border border-gold-soft/20 shadow-inner group/vision hover:border-gold-primary/40 transition-colors h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Compass size={24} className="text-gold-primary group-hover/vision:animate-spin-slow" />
                    <h4 className="text-xl font-bold text-brown-primary uppercase tracking-[0.2em]">Departmental Vision</h4>
                  </div>
                  <p className="italic text-brown-secondary serif leading-relaxed">
                    &quot;To be recognized as a Centre of excellence in Electronics and Communication Engineering education, higher studies and research as per the needs of industry, deeply inculcating professional ethics and duly nurturing all-round personality development.&quot;
                  </p>
                </div>

                <div className="bg-gradient-to-br from-parchment-base/80 to-transparent p-8 rounded-[2rem] border border-gold-soft/20 shadow-inner group/mission hover:border-gold-primary/40 transition-colors h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Target size={24} className="text-gold-primary group-hover/mission:scale-110 transition-transform" />
                    <h4 className="text-xl font-bold text-brown-primary uppercase tracking-[0.2em]">Departmental Mission</h4>
                  </div>
                  <ul className="space-y-4 text-brown-secondary serif leading-relaxed">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex items-center justify-center bg-gold-soft/20 text-gold-primary font-bold text-xs rounded-full w-7 h-7 shrink-0 shadow-sm border border-gold-soft/30">M1</div>
                      <span>Offer state-of-art infrastructure for teaching, learning, research activities and innovative hands-on engineering projects.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex items-center justify-center bg-gold-soft/20 text-gold-primary font-bold text-xs rounded-full w-7 h-7 shrink-0 shadow-sm border border-gold-soft/30">M2</div>
                      <span>Deliver curricula to meet ever changing industry requirements and cope up with present trends in higher studies and research.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex items-center justify-center bg-gold-soft/20 text-gold-primary font-bold text-xs rounded-full w-7 h-7 shrink-0 shadow-sm border border-gold-soft/30">M3</div>
                      <span>Promote all-round personality development of students through interaction with alumni and industry experts.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex items-center justify-center bg-gold-soft/20 text-gold-primary font-bold text-xs rounded-full w-7 h-7 shrink-0 shadow-sm border border-gold-soft/30">M4</div>
                      <span>Motivate and upgrade faculty members for departmental success, growth and quality enhancement.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Achievements Grid */}
        <div className="space-y-16">
          <div className="flex items-center gap-4 border-b border-gold-soft/20 pb-8">
            <Trophy size={32} className="text-brown-primary" />
            <h3 className="text-4xl font-bold text-brown-primary serif">Departmental Achievements</h3>
          </div>

          {loading ? (
            <div className="py-20 text-center text-brown-secondary italic serif text-2xl animate-pulse">
              Consulting the archives...
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-brown-secondary/40 italic serif text-xl border-2 border-dashed border-gold-soft/20 rounded-[3rem]">
              The annals are awaiting the first entry from the Command Center.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {items.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedItem(item)}
                  className="theme-card p-6 rounded-[2.5rem] group cursor-pointer hover:border-gold-primary transition-all duration-500 shadow-xl hover:shadow-2xl flex flex-col"
                >
                  <div className="relative aspect-video rounded-[1.8rem] overflow-hidden border border-gold-soft/10 mb-6 bg-card-tone">
                    <Image 
                      src={item.imageURL} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                      alt={item.title} 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-4 bg-parchment-base/80 backdrop-blur-md rounded-full text-brown-primary border border-gold-soft/30 transform scale-75 group-hover:scale-100 transition-transform">
                        <Maximize2 size={24} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <h4 className="text-2xl font-bold text-brown-primary serif leading-tight">{item.title}</h4>
                    <p className="text-brown-secondary/70 italic serif text-sm leading-relaxed line-clamp-3">
                      &quot;{item.shortDescription}&quot;
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gold-soft/10 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-brown-primary uppercase tracking-[0.3em]">Read Details</span>
                    <History size={14} className="text-gold-primary/40" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Accent */}
        <div className="text-center py-24 border-t border-gold-soft/10">
          <p className="text-[10px] font-bold text-brown-secondary/30 uppercase tracking-[0.8em]">
            History is being written in real-time.
          </p>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-parchment-base/95 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-card-tone border border-gold-soft/30 rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-10 p-3 bg-parchment-base/80 backdrop-blur-md rounded-full text-brown-primary hover:bg-gold-primary hover:text-black transition-all border border-gold-soft/20 shadow-lg"
              >
                <X size={24} />
              </button>

              <div className="flex-1 overflow-y-auto">
                <div className="relative aspect-video md:aspect-[21/9] w-full border-b border-gold-soft/20">
                  <Image 
                    src={selectedItem.imageURL} 
                    fill 
                    className="object-cover" 
                    alt={selectedItem.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card-tone via-transparent to-transparent" />
                </div>

                <div className="p-6 md:p-16 space-y-6 md:space-y-8">
                  <div className="space-y-3 md:space-y-4">
                    <div className="inline-flex items-center gap-2 text-gold-primary text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em]">
                      <Trophy size={12} /> Official Archive Record
                    </div>
                    <h3 className="text-3xl md:text-6xl font-bold text-brown-primary serif leading-tight">
                      {selectedItem.title}
                    </h3>
                    <p className="text-lg md:text-2xl text-brown-secondary italic serif border-l-4 border-gold-primary/30 pl-4 md:pl-6 py-2">
                      &quot;{selectedItem.shortDescription}&quot;
                    </p>
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <div className="text-brown-primary text-base md:text-xl leading-relaxed serif whitespace-pre-wrap">
                      {selectedItem.fullDescription}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-parchment-base/40 border-t border-gold-soft/20 flex justify-center">
                <p className="text-[10px] font-bold text-brown-secondary/30 uppercase tracking-[0.5em]">
                  Documented in the Eternal Ledger of 2026
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Trophy({ size, className = "" }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 22V18" />
      <path d="M14 22V18" />
      <path d="M18 4H6v7a6 6 0 0 0 12 0V4Z" />
    </svg>
  );
}
