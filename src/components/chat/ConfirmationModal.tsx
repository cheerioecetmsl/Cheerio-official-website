import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brown-primary/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-parchment-base rounded-2xl sm:rounded-3xl shadow-2xl border border-gold-soft/50 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>

        {/* Header */}
        <div className="relative px-6 pt-8 pb-4 flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border shadow-inner ${
            type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
            type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
            'bg-gold/10 border-gold/20 text-gold-primary'
          }`}>
            <AlertCircle size={28} />
          </div>
          <h3 className="text-xl font-bold text-brown-primary serif tracking-tight">
            {title}
          </h3>
          <p className="mt-2 text-sm text-brown-secondary/70 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="relative p-6 pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-brown-primary/10 text-brown-primary font-bold text-xs uppercase tracking-widest hover:bg-brown-primary/5 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
              type === 'danger' ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' :
              type === 'warning' ? 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600' :
              'bg-gold-primary text-brown-primary shadow-gold-primary/20 hover:bg-gold-glow'
            }`}
          >
            {confirmText}
          </button>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-brown-primary/5 text-brown-primary/20 hover:text-brown-primary transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
