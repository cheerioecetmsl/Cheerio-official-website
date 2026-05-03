import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Video, Paperclip, X, Smile, Loader2, Shield } from 'lucide-react';
import { uploadGenericFile } from '@/lib/uploadHelper';
import { setTypingStatus, searchUsers } from '@/lib/chat';
import { EmojiPicker } from './EmojiPicker';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (text: string, media?: { url: string; type: 'image' | 'video' | 'file' }) => Promise<void>;
  user: { uid: string; displayName: string };
  isMuted?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, user, isMuted }) => {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<{ file: File; type: 'image' | 'video' | 'file' } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentionResults, setShowMentionResults] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mentionIndexRef = useRef<number>(-1);

  const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    
    // Mention detection
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1 && (lastAtSymbol === 0 || textBeforeCursor[lastAtSymbol - 1] === ' ')) {
      const queryStr = textBeforeCursor.substring(lastAtSymbol + 1);
      mentionIndexRef.current = lastAtSymbol;
      setMentionSearch(queryStr);
      const results = await searchUsers(queryStr);
      
      // If no results and there's a space, it's likely a normal message, so close the list
      if (results.length === 0 && queryStr.includes(' ')) {
        setShowMentionResults(false);
      } else {
        setMentionResults(results);
        setShowMentionResults(true);
      }
    } else {
      setShowMentionResults(false);
    }

    // Typing status
    setTypingStatus(user.uid, user.displayName, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(user.uid, user.displayName, false);
    }, 3000);
  };

  const handleMentionSelect = (userName: string) => {
    const cursorPosition = textAreaRef.current?.selectionStart || 0;
    const before = text.substring(0, mentionIndexRef.current);
    const after = text.substring(cursorPosition);
    const newText = `${before}@${userName} ${after}`;
    setText(newText);
    setShowMentionResults(false);
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newPos = before.length + userName.length + 2; // +1 for @, +1 for space
        textAreaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleEmojiSelect = (emoji: string) => {
    // If it looks like a URL, it's a sticker
    if (emoji.startsWith('http')) {
      onSendMessage('', { url: emoji, type: 'image' });
      setShowEmojiPicker(false);
      return;
    }

    const cursorPosition = textAreaRef.current?.selectionStart || 0;
    const before = text.substring(0, cursorPosition);
    const after = text.substring(cursorPosition);
    const newText = before + emoji + after;
    setText(newText);
    setShowEmojiPicker(false);
    
    // Set focus back to textarea
    setTimeout(() => textAreaRef.current?.focus(), 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedMedia({ file, type });
      if (type === 'image') {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const clearMedia = () => {
    setSelectedMedia(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !selectedMedia) || isUploading || isMuted) return;

    try {
      setIsUploading(true);
      let mediaData = undefined;

      if (selectedMedia) {
        const folder = selectedMedia.type === 'image' ? 'Images' : 
                      selectedMedia.type === 'video' ? 'Videos' : 'Files';
        
        const result = await uploadGenericFile(
          selectedMedia.file,
          folder,
          (progress) => setUploadProgress(progress)
        );
        mediaData = { url: result.url, type: selectedMedia.type };
      }

      await onSendMessage(text.trim(), mediaData);
      setText('');
      clearMedia();
      setTypingStatus(user.uid, user.displayName, false);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (isMuted) {
    return (
      <div className="p-4 bg-red-500/10 border-t border-red-500/20 text-center">
        <p className="text-sm text-red-400 font-medium">You have been muted by an admin.</p>
      </div>
    );
  }

  return (
    <div className="bg-transparent pt-4">
      {/* Media Preview Area */}
      {selectedMedia && (
        <div className="mb-4 p-3 rounded-2xl bg-card-tone border border-gold-soft backdrop-blur-2xl flex items-center gap-4 relative animate-in slide-in-from-bottom-4 duration-300 shadow-xl">
          <div className="relative group">
            {previewUrl ? (
              <img src={previewUrl} className="w-16 h-16 rounded-xl object-cover border border-gold-soft/30" alt="Preview" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gold-primary/10 flex items-center justify-center border border-gold-soft/30">
                {selectedMedia.type === 'video' ? <Video className="text-gold-primary" size={24} /> : <Paperclip className="text-gold-primary" size={24} />}
              </div>
            )}
            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-brown-primary uppercase tracking-tighter">Selected</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-brown-primary tracking-tight truncate mb-0.5">{selectedMedia.file.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gold-primary font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gold-primary/10 border border-gold-soft/30">
                {selectedMedia.type}
              </span>
              <span className="text-[10px] text-brown-secondary/60 font-medium">Ready to transmit</span>
            </div>
          </div>

          <button 
            onClick={clearMedia}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-brown-primary/5 hover:bg-red-500/10 text-brown-primary/40 hover:text-red-500 transition-all active:scale-95"
          >
            <X size={20} />
          </button>
          
          {isUploading && (
            <div className="absolute inset-x-0 -bottom-px h-1 bg-brown-primary/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gold-primary via-gold-glow to-gold-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSend} className="relative group">
        <div className="flex items-end gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-[1.5rem] sm:rounded-[24px] bg-input-bg border border-gold-soft/50 shadow-inner focus-within:border-gold-primary transition-all duration-500">
          {/* Action Buttons Left */}
          <div className="flex items-center gap-1 pl-1 mb-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all active:scale-90 ${showEmojiPicker ? 'bg-gold/10 text-gold-primary' : 'text-brown-primary/30 hover:text-gold-primary'}`}
            >
              <Smile size={18} className="sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'image/*,video/*,.pdf,.doc,.docx,.zip';
                  fileInputRef.current.click();
                }
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-2xl hover:bg-gold-primary/10 text-brown-primary/30 hover:text-gold-primary transition-all active:scale-90"
            >
              <Paperclip size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Text Area */}
          <div className="flex-1 min-w-0 py-1 relative">
            <AnimatePresence>
              {showEmojiPicker && (
                <EmojiPicker 
                  onSelect={handleEmojiSelect} 
                  onClose={() => setShowEmojiPicker(false)} 
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showMentionResults && (
                <>
                  {/* Click outside to close mention list */}
                  <div 
                    className="fixed inset-0 z-[45]" 
                    onClick={() => setShowMentionResults(false)}
                  />
                  <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-4 w-64 bg-parchment-base border border-gold-soft/50 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-2 border-b border-gold-soft/20 bg-parchment-contrast/50">
                    <span className="text-[9px] font-black text-gold-primary uppercase tracking-widest">Select Citizen</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {mentionResults.length === 0 ? (
                      <div className="px-4 py-3 text-[10px] font-bold text-brown-secondary/40 uppercase tracking-widest text-center">
                        No citizens found
                      </div>
                    ) : (
                      mentionResults.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleMentionSelect(u.name)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gold/10 transition-colors border-b border-gold-soft/10 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-gold-soft/30 bg-gold/5 flex items-center justify-center">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-brown-primary/40">{u.name[0]}</span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-brown-primary serif">{u.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
                </>
              )}
            </AnimatePresence>

            <textarea
              ref={textAreaRef}
              value={text}
              onChange={handleTextChange}
              placeholder="Transmit..."
              className="w-full bg-transparent border-none focus:ring-0 text-brown-primary p-1.5 sm:p-2 min-h-[40px] sm:min-h-[44px] max-h-32 sm:max-h-40 resize-none text-[14px] sm:text-[15px] leading-relaxed custom-scrollbar placeholder:text-brown-secondary/30"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!text.trim() && !selectedMedia) || isUploading}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[1.2rem] sm:rounded-[20px] transition-all duration-500 flex items-center justify-center relative group/send
              ${(!text.trim() && !selectedMedia) || isUploading 
                ? 'bg-brown-primary/5 text-brown-primary/10' 
                : 'bg-gold-primary text-white hover:scale-105 active:scale-95 shadow-md shadow-gold-primary/20'
              }
            `}
          >
            {isUploading ? (
              <Loader2 size={18} className="animate-spin sm:w-5 sm:h-5" />
            ) : (
              <Send size={18} className="sm:w-5 sm:h-5 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>

        {/* Input Footer / Quick Labels */}
        <div className="flex items-center justify-between px-4 sm:px-6 mt-2 sm:mt-3">
          <div className="flex gap-3 sm:gap-4">
            <span className="text-[8px] sm:text-[9px] font-black text-brown-secondary/30 uppercase tracking-[0.2em] flex items-center gap-1 sm:gap-1.5">
              <Shield size={9} className="text-gold-primary" /> <span className="hidden xs:inline">Secure</span>
            </span>
            <span className="text-[8px] sm:text-[9px] font-black text-brown-secondary/30 uppercase tracking-[0.2em]">
              {text.length} <span className="hidden xs:inline">Chars</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button type="button" className="text-[8px] sm:text-[9px] font-black text-brown-secondary/30 hover:text-gold-primary uppercase tracking-[0.2em] transition-colors">
              <span className="hidden sm:inline">Markdown Support</span>
              <span className="sm:hidden">MD</span>
            </button>
          </div>
        </div>
      </form>

      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const type = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'video' : 'file';
          handleFileSelect(e, type);
        }}
      />
    </div>
  );
};
