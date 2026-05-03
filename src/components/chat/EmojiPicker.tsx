import React, { useState } from 'react';
import { Smile, Zap, Heart, Star, Coffee, Ghost, Rocket, Crown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  { icon: Smile, label: 'Faces', emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'] },
  { icon: Heart, label: 'Love', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💏', '💑', '💋', '💍', '💎'] },
  { icon: Zap, label: 'Energy', emojis: ['⚡', '🔥', '✨', '🌟', '⭐', '🌈', '☁️', '☀️', '🌤️', '⛅', '🌥️', '🌦️', '🌧️', '⛈️', '🌩️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌫️', '🌊', '💧', '💦', '☂️'] },
  { icon: Star, label: 'Common', emojis: ['✅', '❌', '⚠️', '🔔', '📢', '💯', '👏', '🙌', '🎉', '🎈', '🎊', '🎁', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎫', '🎟️'] },
  { icon: Coffee, label: 'Food', emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🧉', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾'] },
];

const STICKERS = [
  // Animated/Premium Stickers from Noto Emoji
  { id: '1', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/512.webp', name: 'Grinning' },
  { id: '2', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/512.webp', name: 'Laughing' },
  { id: '3', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60d/512.webp', name: 'Love Eyes' },
  { id: '4', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60e/512.webp', name: 'Cool' },
  { id: '5', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/512.webp', name: 'Star Eyes' },
  { id: '6', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp', name: 'Fire' },
  { id: '7', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.webp', name: 'Rocket' },
  { id: '8', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4af/512.webp', name: '100' },
  { id: '9', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f/512.webp', name: 'Clapping' },
  { id: '10', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.webp', name: 'Party' },
  { id: '11', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f47b/512.webp', name: 'Ghost' },
  { id: '12', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f48e/512.webp', name: 'Gem' },
  { id: '13', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/512.webp', name: 'Party Face' },
  { id: '14', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f911/512.webp', name: 'Money Mouth' },
  { id: '15', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f92c/512.webp', name: 'Swearing' },
  { id: '16', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f92d/512.webp', name: 'Cover Mouth' },
  { id: '17', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f974/512.webp', name: 'Dizzy' },
  { id: '18', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f92e/512.webp', name: 'Vomiting' },
  { id: '19', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f92f/512.webp', name: 'Exploding' },
  { id: '20', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.webp', name: 'Smiling Hearts' },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'sticker'>('emoji');
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <>
      {/* Click outside to close */}
      <div 
        className="fixed inset-0 z-50 pointer-events-auto" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="fixed md:absolute bottom-[100px] md:bottom-full left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 mb-4 w-[92vw] md:w-[400px] max-w-[400px] h-[70vh] md:h-[450px] bg-parchment-base border border-gold-soft/50 rounded-3xl shadow-2xl shadow-gold/20 overflow-hidden z-[60] flex flex-col"
      >
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>

        {/* Header */}
        <div className="relative flex items-center border-b border-gold-soft/30 bg-parchment-contrast/50 pr-2">
          <div className="flex flex-1">
            <button 
              onClick={() => setActiveTab('emoji')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'emoji' ? 'text-gold-primary' : 'text-brown-secondary/40 hover:text-brown-primary'}`}
            >
              Emojis
              {activeTab === 'emoji' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-primary" />}
            </button>
            <button 
              onClick={() => setActiveTab('sticker')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'sticker' ? 'text-gold-primary' : 'text-brown-secondary/40 hover:text-brown-primary'}`}
            >
              Stickers
              {activeTab === 'sticker' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-primary" />}
            </button>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gold/10 text-brown-primary/40 hover:text-red-500 transition-all active:scale-90"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 relative overflow-y-auto custom-scrollbar p-4">
          {activeTab === 'emoji' ? (
            <div className="space-y-6">
              {EMOJI_CATEGORIES.map((category, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-3 sticky top-0 bg-parchment-base/80 backdrop-blur-sm z-10 py-1">
                    <category.icon size={12} className="text-gold-primary" />
                    <span className="text-[10px] font-black text-brown-primary/40 uppercase tracking-widest">{category.label}</span>
                    <div className="h-px flex-1 bg-brown-primary/10" />
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-2">
                    {category.emojis.map((emoji, eIdx) => (
                      <button 
                        key={eIdx}
                        onClick={() => onSelect(emoji)}
                        className="text-xl sm:text-2xl p-1.5 hover:bg-gold/10 rounded-xl transition-all hover:scale-125 active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {STICKERS.map((sticker) => (
                <button 
                  key={sticker.id}
                  onClick={() => onSelect(sticker.url)}
                  className="group relative aspect-square rounded-2xl bg-gold/5 border border-gold-soft/20 flex items-center justify-center hover:bg-gold/10 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <img src={sticker.url} alt={sticker.name} className="w-16 h-16 object-contain group-hover:rotate-6 transition-transform" />
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative px-4 py-3 bg-parchment-contrast/30 border-t border-gold-soft/20 flex justify-between items-center">
          <span className="text-[9px] font-bold text-brown-secondary/40 uppercase tracking-widest">Cheerio Premium Assets</span>
          <div className="flex gap-1.5">
            {EMOJI_CATEGORIES.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeCategory ? 'bg-gold-primary' : 'bg-gold/20'}`} />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};
