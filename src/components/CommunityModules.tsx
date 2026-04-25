"use client";

import { Search, Filter, Mail, Instagram } from "lucide-react";

export const ProfileCard = ({ profile }: { profile: any }) => (
  <div className="glass-card p-6 rounded-3xl border-gold/10 hover:border-gold/30 transition-all group">
    <div className="relative w-24 h-24 mx-auto mb-6">
      <div className="w-full h-full rounded-full border-2 border-gold/20 overflow-hidden group-hover:border-gold transition-colors">
        <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gold text-ink text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
        {profile.role}
      </div>
    </div>
    
    <div className="text-center space-y-1">
      <h3 className="font-bold serif text-ink dark:text-gold uppercase tracking-widest">{profile.name}</h3>
      <p className="text-[10px] text-ink/40 dark:text-dark-text/40 font-bold uppercase tracking-[0.2em]">
        {profile.year} | SEC {profile.section}
      </p>
    </div>

    <div className="mt-6 flex items-center justify-center gap-4 border-t border-gold/5 pt-6">
      <button className="text-ink/30 hover:text-gold transition-colors">
        <Mail size={16} />
      </button>
      <button className="text-ink/30 hover:text-gold transition-colors">
        <Instagram size={16} />
      </button>
    </div>
  </div>
);

export const DirectoryHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
    <div className="space-y-2">
      <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold serif">The Community Hub</span>
      <h1 className="text-4xl md:text-5xl font-bold text-ink dark:text-gold serif">{title}</h1>
      <p className="text-ink/60 dark:text-dark-text/60 italic serif">{description}</p>
    </div>
    
    <div className="flex items-center gap-4 w-full md:w-auto">
      <div className="relative flex-grow md:w-64">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40" />
        <input 
          type="text" 
          placeholder="Search identity..."
          className="w-full bg-ink/5 dark:bg-white/5 border border-gold/10 rounded-full pl-12 pr-6 py-3 text-sm focus:border-gold outline-none transition-all"
        />
      </div>
      <button className="p-3 bg-ink/5 dark:bg-white/5 border border-gold/10 rounded-full text-gold">
        <Filter size={18} />
      </button>
    </div>
  </div>
);
