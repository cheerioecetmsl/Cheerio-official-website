"use client";

import { DirectoryHeader, ProfileCard } from "@/components/CommunityModules";

const mockSeniors = [
  { id: 1, name: "Dr. Vikram Seth", role: "MENTOR", year: "Faculty", section: "CSE", photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80" },
  { id: 2, name: "Meera Oberoi", role: "ALUMNI", year: "Batch of 22", section: "ECE", photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80" },
];

export default function SeniorsPage() {
  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <DirectoryHeader 
          title="The Guardians" 
          description="Honoring the mentors and alumni who paved the way for the 2026 legacy." 
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockSeniors.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </div>
    </main>
  );
}
