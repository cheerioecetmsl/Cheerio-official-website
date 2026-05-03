import React from 'react';
import { X, Download, Maximize2, Minimize2 } from 'lucide-react';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'file';
}

export const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, mediaUrl, mediaType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute top-4 right-4 flex items-center gap-4 z-[210]">
        <a 
          href={mediaUrl} 
          download 
          target="_blank"
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
          title="Download Archive"
        >
          <Download size={24} />
        </a>
        <button 
          onClick={onClose}
          className="p-3 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-all hover:scale-110 active:scale-95"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 animate-in zoom-in-95 duration-500">
        {mediaType === 'image' && (
          <img 
            src={mediaUrl} 
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl shadow-gold/10" 
            alt="Archive Preview" 
          />
        )}
        {mediaType === 'video' && (
          <video 
            src={mediaUrl} 
            controls 
            autoPlay
            className="max-w-full max-h-full rounded-2xl shadow-2xl shadow-gold/10" 
          />
        )}
      </div>

      {/* Aesthetic Border Glow */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-white/[0.02] rounded-3xl m-4" />
    </div>
  );
};
