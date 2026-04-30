"use client";

import { Search, Filter, Mail, Camera } from "lucide-react";
import Image from "next/image";

export interface ArchiveProfile {
  id: string;
  name: string;
  photoURL: string;
  role?: string;
  year: string;
  section?: string;
  narrative?: string;
}

export const ProfileCard = ({ profile }: { profile: ArchiveProfile }) => (
  <div className="glass-card p-6 rounded-3xl border-gold/10 hover:border-gold/30 transition-all group">
    <div className="relative w-24 h-24 mx-auto mb-6">
      <div className="relative w-full h-full rounded-full border-2 border-gold/20 overflow-hidden group-hover:border-gold transition-colors">
        <Image src={profile.photoURL} alt={profile.name} fill sizes="96px" className="object-cover" />
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gold-soft/30 text-brown-primary text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest whitespace-nowrap border border-gold-soft/20 backdrop-blur-sm">
        {profile.role || profile.year}
      </div>
    </div>
    
    <div className="text-center space-y-1">
      <h3 className="font-bold serif text-brown-primary uppercase tracking-widest">{profile.name}</h3>
      <p className="text-[10px] text-brown-secondary/40 font-bold uppercase tracking-[0.2em]">
        {profile.year} {profile.section ? `| SEC ${profile.section}` : ""}
      </p>
      {profile.narrative && (
        <p className="pt-4 text-[11px] text-brown-secondary/60 italic serif leading-relaxed">
          &quot;{profile.narrative}&quot;
        </p>
      )}
    </div>
 
    <div className="mt-6 flex items-center justify-center gap-4 border-t border-gold-soft/10 pt-6">
      <button className="text-brown-secondary/30 hover:text-brown-primary transition-colors">
        <Mail size={16} />
      </button>
      <button className="text-brown-secondary/30 hover:text-brown-primary transition-colors">
        <Camera size={16} />
      </button>
    </div>
  </div>
);

export const DirectoryHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
    <div className="space-y-2">
      <span className="text-brown-primary uppercase tracking-[0.4em] text-[10px] font-bold serif">The Community Hub</span>
      <h1 className="text-4xl md:text-5xl font-bold text-brown-primary serif">{title}</h1>
      <p className="text-brown-secondary/60 italic serif">{description}</p>
    </div>
    
    <div className="flex items-center gap-4 w-full md:w-auto">
      <div className="relative flex-grow md:w-64">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-primary/40" />
        <input 
          type="text" 
          placeholder="Search identity..."
          className="w-full bg-brown-primary/5 border border-gold-soft/20 rounded-full pl-12 pr-6 py-3 text-sm focus:border-gold-primary outline-none transition-all text-black"
        />
      </div>
      <button className="p-3 bg-brown-primary/5 border border-gold-soft/20 rounded-full text-brown-primary">
        <Filter size={18} />
      </button>
    </div>
  </div>
);
