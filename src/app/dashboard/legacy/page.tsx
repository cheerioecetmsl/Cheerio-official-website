"use client";

import { ReturnToDashboard } from "@/components/Sidebar";
import { School, History, Sparkles, BookOpen, Quote } from "lucide-react";
import Image from "next/image";

export default function LegacyPage() {
  return (
    <main className="min-h-screen py-24 px-8 overflow-hidden">
      <ReturnToDashboard />
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto space-y-24 relative z-10">
        
        {/* Cinematic Header */}
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-card-tone border border-gold-soft/30 rounded-full text-gold-primary text-[10px] font-bold tracking-[0.5em] uppercase animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles size={14} /> The Eternal Ledger
          </div>
          <h1 className="text-6xl md:text-9xl font-bold text-brown-primary serif tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Our Legacy.
          </h1>
          <p className="text-brown-secondary italic serif text-2xl max-w-3xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-300">
            Tracing the lineage of visionaries, department history, and the foundations that built the Batch of 2026.
          </p>
        </div>

        {/* Feature Image - Placeholder */}
        <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden border border-gold/20 shadow-2xl group">
          <Image 
            src="/assets/department_hero.jpg" 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-105" 
            alt="Department History" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12">
            <p className="text-gold font-bold uppercase tracking-[0.3em] text-xs">Foundation Archive</p>
            <h2 className="text-4xl font-bold text-white serif mt-2">The Genesis of Excellence</h2>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="md:col-span-2 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-gold-primary">
                <History size={32} />
                <h3 className="text-3xl font-bold serif text-brown-primary">The Inception</h3>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-brown-secondary text-xl leading-relaxed serif italic">
                  Established with a vision to redefine the boundaries of technical mastery, our department has stood as a beacon of innovation for decades. From the early days of foundational research to the high-fidelity ecosystem of the Batch of 2026, the journey has been one of relentless pursuit.
                </p>
                <p className="text-brown-secondary text-xl leading-relaxed serif italic">
                  Each milestone achieved is a testament to the grit and creativity of those who walked these halls before us. We are not just building a batch; we are honoring a lineage.
                </p>
              </div>
            </div>

            <div className="p-12 bg-card-tone rounded-[3rem] border border-gold-soft/30 relative overflow-hidden">
              <Quote className="absolute -top-4 -left-4 text-gold-soft/30 w-32 h-32" />
              <p className="text-2xl font-bold serif text-gold-primary italic relative z-10">
                &quot;The legacy we leave is not just in the code we write or the structures we build, but in the people we inspire to carry the torch forward.&quot;
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card p-8 rounded-3xl border-gold/10 space-y-6">
              <BookOpen className="text-gold" size={24} />
              <h4 className="text-lg font-bold text-ink dark:text-gold uppercase tracking-widest">Key Milestones</h4>
              <ul className="space-y-4">
                {[
                  { year: "199X", event: "Department Foundation" },
                  { year: "2010", event: "Innovation Lab Launch" },
                  { year: "2018", event: "Global Recognition" },
                  { year: "2026", event: "The Cheerio Era" }
                ].map((m, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="font-bold text-gold tabular-nums">{m.year}</span>
                    <span className="text-sm text-ink/60 dark:text-dark-text/60 italic serif">{m.event}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-8 rounded-3xl border-gold/10 space-y-4">
              <School className="text-gold" size={24} />
              <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Institutional Pride</p>
              <p className="text-xs text-ink/60 dark:text-dark-text/60 leading-relaxed italic serif">
                Ranked among the top tiers for academic excellence and archival contribution.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Accent */}
        <div className="text-center py-24 border-t border-gold/10">
          <p className="text-[10px] font-bold text-gold/30 uppercase tracking-[0.8em]">
            History is being written in real-time.
          </p>
        </div>
      </div>
    </main>
  );
}
