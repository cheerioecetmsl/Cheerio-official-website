import React, { useState } from 'react';
import { ChatMessage, deleteMessage, editMessage } from '@/lib/chat';
import { format } from 'date-fns';
import { Shield, MoreVertical, Trash2, Pencil, X, Check, Eye, Maximize2 } from 'lucide-react';
import { CheerioImage } from '@/lib/imageVariants';
import { MediaModal } from './MediaModal';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  isAdmin: boolean;
  isFirstInGroup?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isMe, 
  isAdmin,
  isFirstInGroup = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const time = message.createdAt?.toDate 
    ? format(message.createdAt.toDate(), 'HH:mm')
    : format(new Date(), 'HH:mm');

  const handleEdit = async () => {
    if (!editText.trim() || editText === message.text) {
      setIsEditing(false);
      return;
    }
    await editMessage(message.id, editText);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to remove this message from the archive?");
    if (confirmDelete) {
      await deleteMessage(message.id, isMe ? 'self' : 'admin');
    }
  };

  if (message.deleted) {
    return (
      <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className={`px-4 py-2 rounded-2xl border border-dashed text-[11px] font-medium italic ${isMe ? 'border-brown-primary/10 text-brown-primary/30' : 'border-gold-soft/20 text-brown-secondary/30'}`}>
          {message.deletedBy === 'admin' ? 'Archive entry redacted by Custodian' : 'Message removed by sender'}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group mb-1 sm:mb-1.5 relative`}>
      <div className={`flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Area */}
        <div className="w-7 sm:w-8 flex-shrink-0 flex justify-center pt-1">
          {isFirstInGroup && (
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border shadow-sm ${isMe ? 'border-gold-primary/30' : 'border-white/10'}`}>
              {(message.senderAvatar || message.senderPhotoBaseId || message.senderPhoto) ? (
                <CheerioImage 
                  baseId={message.senderPhotoBaseId}
                  fallbackUrl={message.senderAvatar || message.senderPhoto}
                  alt={message.senderName}
                  variant="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold rounded-full ${isMe ? 'bg-brown-primary/10 text-brown-primary' : 'bg-white/5 text-white/40'}`}>
                  {message.senderName?.[0] || '?'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          {isFirstInGroup && (
            <span className={`text-[9px] sm:text-[10px] font-bold ml-1 mb-1 uppercase tracking-wider px-1 ${isMe ? 'text-brown-secondary/50' : 'text-gold-primary'}`}>
              {isMe ? 'You' : message.senderName}
            </span>
          )}
          
          <div className="relative group/bubble flex items-center gap-2">
            {/* Options Trigger (Left side for incoming, Right side for outgoing) */}
            {(isMe || isAdmin) && !isEditing && (
              <div className={`opacity-0 group-hover/bubble:opacity-100 transition-opacity flex gap-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {isMe && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg bg-parchment-contrast/80 text-brown-primary/40 hover:text-gold-primary transition-all border border-gold-soft/20 shadow-sm"
                  >
                    <Pencil size={12} />
                  </button>
                )}
                <button 
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg bg-parchment-contrast/80 text-brown-primary/40 hover:text-red-500 transition-all border border-gold-soft/20 shadow-sm"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}

            <div className={`
              relative p-3 sm:p-3.5 rounded-[1.2rem] sm:rounded-2xl shadow-md transition-all duration-300
              ${isMe 
                ? 'bg-gold-primary text-brown-primary rounded-tr-none shadow-gold-primary/10' 
                : 'bg-card-tone border border-gold-soft/30 text-brown-primary rounded-tl-none'}
              ${!isFirstInGroup && (isMe ? 'rounded-tr-[1.2rem] sm:rounded-tr-2xl' : 'rounded-tl-[1.2rem] sm:rounded-tl-2xl')}
              group-hover:translate-y-[-1px] group-hover:shadow-lg
            `}>
              {/* Text Content */}
              {isEditing ? (
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <textarea 
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="bg-white/10 border-none focus:ring-0 text-sm p-0 w-full resize-none serif font-medium placeholder:text-brown-primary/20"
                    rows={Math.max(1, editText.split('\n').length)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 border-t border-brown-primary/10 pt-2">
                    <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-brown-primary/10 rounded">
                      <X size={14} />
                    </button>
                    <button onClick={handleEdit} className="p-1 hover:bg-brown-primary/10 rounded">
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                message.text && (
                  <p className="text-[13px] sm:text-[14px] leading-relaxed whitespace-pre-wrap break-words serif font-medium">
                    {message.text}
                    {message.edited && <span className="ml-2 opacity-40 text-[10px] font-bold italic select-none inline-flex items-center gap-1"><span className="w-0.5 h-0.5 rounded-full bg-current" />edited</span>}
                  </p>
                )
              )}

              {/* Media Content */}
              {message.mediaUrl && !isEditing && (
                <div className={`mt-2 rounded-xl overflow-hidden border ${isMe ? 'border-brown-primary/20' : 'border-gold-soft/30'} ${message.text ? 'pt-0' : ''}`}>
                  {message.mediaType === 'image' && (
                    <div className="relative group/media">
                      <img 
                        src={message.mediaUrl} 
                        alt="attachment" 
                        className="max-h-[300px] w-full object-cover transition-all duration-500 cursor-pointer"
                        onClick={() => setIsMediaOpen(true)}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <Eye className="text-white" size={24} />
                      </div>
                    </div>
                  )}
                  {message.mediaType === 'video' && (
                    <div className="relative group/media">
                      <video 
                        src={message.mediaUrl} 
                        className="max-h-[300px] w-full cursor-pointer"
                        onClick={() => setIsMediaOpen(true)}
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer" onClick={() => setIsMediaOpen(true)}>
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                          <Maximize2 className="text-white" size={24} />
                        </div>
                      </div>
                    </div>
                  )}
                  {message.mediaType === 'file' && (
                    <a 
                      href={message.mediaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-brown-primary/10 text-brown-primary">
                        <Shield size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brown-primary/80">View Document</span>
                        <span className="text-[9px] text-brown-secondary/40 uppercase tracking-widest font-black">Archive Secured</span>
                      </div>
                    </a>
                  )}
                </div>
              )}

              {/* Meta Info (Timestamp + Status) */}
              <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${isMe ? 'text-brown-primary/40' : 'text-brown-secondary/40'}`}>
                <span className="text-[9px] font-bold tracking-tight">{time}</span>
                {isMe && (
                  <div className="flex items-center">
                    <div className="w-1 h-1 rounded-full bg-brown-primary/30" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaModal 
        isOpen={isMediaOpen} 
        onClose={() => setIsMediaOpen(false)} 
        mediaUrl={message.mediaUrl || ''} 
        mediaType={message.mediaType || 'image'} 
      />
    </div>
  );
};
