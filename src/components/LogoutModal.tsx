"use client";

import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onCancel: () => void;
}

export function LogoutModal({ isOpen, onCancel }: LogoutModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await auth.signOut();
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Modal card */}
      <div
        className="relative z-[210] max-w-sm w-full rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in zoom-in fade-in duration-300"
        style={{
          background: 'var(--color-parchment-base)',
          border: '1px solid rgba(212,175,55,0.35)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <LogOut size={28} className="text-red-500" />
        </div>

        {/* Copy */}
        <div className="text-center space-y-2">
          <h3
            className="text-2xl font-bold serif"
            style={{ color: 'var(--color-brown-primary)' }}
          >
            Closing the Archive?
          </h3>
          <p
            className="text-sm italic serif leading-relaxed"
            style={{ color: 'var(--color-brown-secondary)' }}
          >
            Are you sure you want to log out of the 2026 chronicles?
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs border transition-all hover:bg-gold-soft/10"
            style={{
              borderColor: 'rgba(212,175,55,0.4)',
              color: 'var(--color-brown-secondary)',
            }}
          >
            <X size={11} className="inline mr-1.5" />
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs bg-red-600 text-black hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut size={11} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
