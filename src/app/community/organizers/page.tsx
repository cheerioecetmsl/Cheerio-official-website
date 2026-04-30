"use client";

import { DirectoryHeader, ProfileCard } from "@/components/CommunityModules";

const mockOrganizers = [
  { id: "1", name: "Sankha Subhra", role: "CHAIR", year: "3rd Year", section: "A", photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80" },
  { id: "2", name: "Riddhi Dutta", role: "TECH LEAD", year: "3rd Year", section: "B", photoURL: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80" },
  { id: "3", name: "Ananya Ray", role: "CULTURAL", year: "2nd Year", section: "C", photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80" },
  { id: "4", name: "Ishaan Gupta", role: "LOGISTICS", year: "3rd Year", section: "A", photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80" },
];

export default function OrganizersPage() {
  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <DirectoryHeader 
          title="The Architects" 
          description="The dedicated team behind the Cheerio 2026 legacy." 
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockOrganizers.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </div>
    </main>
  );
}
