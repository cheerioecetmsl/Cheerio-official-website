"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Zap, Image as ImageIcon, Calendar, ArrowRight } from "lucide-react";
import { HypeUpdate } from "./DashboardModules";
import { CheerioImage } from "@/lib/imageVariants";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: HypeUpdate | null;
}

export const NotificationModal = ({ isOpen, onClose, notification }: NotificationModalProps) => {
  if (!notification) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-parchment-base/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl theme-card rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(107,68,35,0.25)] overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 md:top-8 md:right-8 p-3 bg-brown-primary/5 hover:bg-brown-primary/10 rounded-full transition-colors z-20"
            >
              <X size={20} className="text-brown-primary/40" />
            </button>

            {/* Header Badge */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-3 py-1.5 bg-gold-primary/10 rounded-full border border-gold-primary/20 z-10">
              <span className="w-2 h-2 rounded-full bg-gold-primary animate-ping" />
              <span className="text-[9px] font-bold text-brown-primary uppercase tracking-[0.2em]">New Archive Update</span>
            </div>

            <div className="flex flex-col md:flex-row h-full">
              {/* Media Section (if available) */}
              {notification.mediaGallery && notification.mediaGallery.length > 0 && (
                <div className="relative w-full md:w-5/12 aspect-square md:aspect-auto h-56 md:h-[500px] overflow-hidden bg-parchment-contrast/50">
                  <CheerioImage
                    baseId={notification.mediaBaseIds?.[0]}
                    fallbackUrl={typeof notification.mediaGallery?.[0] === 'string' ? notification.mediaGallery[0] : (notification.mediaGallery?.[0] as any)?.url}
                    alt={notification.title}
                    variant="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              )}

              {/* Content Section */}
              <div className={`p-10 md:p-14 flex flex-col justify-center ${notification.mediaGallery && notification.mediaGallery.length > 0 ? 'md:w-7/12' : 'w-full'}`}>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-brown-secondary/60 text-[10px] font-bold uppercase tracking-[0.3em]">
                      <Calendar size={12} />
                      {notification.date || "Today"}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-brown-primary serif leading-[1.1] tracking-tight">
                      {notification.title}
                    </h2>
                    <div className="inline-flex items-center gap-2 text-[10px] font-bold text-brown-primary bg-gold-soft/20 px-3 py-1 rounded-lg uppercase tracking-[0.2em] border border-gold-soft/10">
                      <Zap size={10} fill="currentColor" /> {notification.tag || "Notification"}
                    </div>
                  </div>

                  <p className="text-brown-secondary italic serif text-xl md:text-2xl leading-relaxed opacity-90">
                    &quot;{notification.content}&quot;
                  </p>

                  <div className="pt-6">
                    <button
                      onClick={onClose}
                      className="gold-button group flex items-center gap-4 px-10 py-5 rounded-2xl transition-all active:scale-95"
                    >
                      <span className="text-xs uppercase tracking-[0.3em]">Understood</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Footer Decor */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-30" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
