"use client";

import { ReturnToDashboard } from "@/components/Sidebar";
import { Users, ShieldCheck, Sparkles, ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    name: "The Council",
    description: "The visionary architects behind the Cheerio reconstruction.",
    path: "/dashboard/community/organizers",
    icon: ShieldCheck,
    role: "Organizers",
    count: "Core Team",
    color: "from-gold/20 via-gold/5 to-transparent"
  },
  {
    name: "The Legends",
    description: "Honoring the seniors of the Batch of 2026 and their lasting legacy.",
    path: "/dashboard/community/seniors",
    icon: Users,
    role: "Seniors",
    count: "Class of 2026",
    color: "from-blue-500/10 via-blue-500/5 to-transparent"
  },
  {
    name: "The Mentors",
    description: "Honoring the faculty and mentors who guided the journey.",
    path: "/dashboard/community/faculty",
    icon: GraduationCap,
    role: "Faculty",
    count: "The Mentors",
    color: "from-amber-500/20 via-amber-500/5 to-transparent"
  }
];

export default function CommunityHub() {
  return (
    <main className="min-h-screen py-24 px-8 overflow-hidden">
      <ReturnToDashboard />
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-card-tone border border-gold-soft/30 rounded-full text-gold-primary text-[10px] font-bold tracking-[0.4em] uppercase">
            <Sparkles size={14} /> The 2026 Directory
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-brown-primary serif tracking-tight">
            Our People.
          </h1>
          <p className="text-brown-secondary italic serif text-xl max-w-2xl mx-auto leading-relaxed">
            Every story in the Cheerio archive is powered by the people who lived it. Explore our community.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {categories.map((category) => (
            <Link 
              key={category.name}
              href={category.path}
              className="group relative block"
            >
              <div className={`relative h-[500px] rounded-[4rem] border border-gold-soft/30 overflow-hidden bg-gradient-to-br ${category.color} transition-all duration-700 group-hover:scale-[1.02] group-hover:border-gold-primary/40 group-hover:shadow-[0_0_80px_rgba(207,174,112,0.15)]`}>
                
                {/* Visual Accent */}
                <div className="absolute top-12 right-12 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700">
                  <category.icon size={180} className="text-gold-primary" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-12 md:p-16 flex flex-col justify-end">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-gold-primary font-bold uppercase tracking-[0.3em] text-xs block">
                        {category.count}
                      </span>
                      <h2 className="text-5xl md:text-6xl font-bold text-brown-primary serif">
                        {category.name}
                      </h2>
                    </div>
                    
                    <p className="text-brown-secondary text-lg serif italic max-w-xs transition-colors group-hover:text-brown-primary">
                      {category.description}
                    </p>

                    <div className="pt-8">
                      <div className="inline-flex items-center gap-4 text-gold-primary font-bold uppercase tracking-widest text-[10px] group-hover:gap-6 transition-all">
                        Enter Directory <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
