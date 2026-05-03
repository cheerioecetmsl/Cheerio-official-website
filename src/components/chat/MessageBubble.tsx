import React from 'react';
import { ChatMessage } from '@/lib/chat';
import { format } from 'date-fns';
import { Shield } from 'lucide-react';
import { CheerioImage } from '@/lib/imageVariants';

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
  const time = message.createdAt?.toDate 
    ? format(message.createdAt.toDate(), 'HH:mm')
    : format(new Date(), 'HH:mm');

  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group mb-1 sm:mb-1.5`}>
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
          
          <div className={`
            relative p-3 sm:p-3.5 rounded-[1.2rem] sm:rounded-2xl shadow-md transition-all duration-300
            ${isMe 
              ? 'bg-gold-primary text-brown-primary rounded-tr-none shadow-gold-primary/10' 
              : 'bg-card-tone border border-gold-soft/30 text-brown-primary rounded-tl-none'}
            ${!isFirstInGroup && (isMe ? 'rounded-tr-[1.2rem] sm:rounded-tr-2xl' : 'rounded-tl-[1.2rem] sm:rounded-tl-2xl')}
            group-hover:translate-y-[-1px] group-hover:shadow-lg
          `}>
            {/* Text Content */}
            {message.text && (
              <p className="text-[13px] sm:text-[14px] leading-relaxed whitespace-pre-wrap break-words serif font-medium">
                {message.text}
              </p>
            )}

            {/* Media Content */}
            {message.mediaUrl && (
              <div className={`mt-2 rounded-xl overflow-hidden border ${isMe ? 'border-brown-primary/20' : 'border-gold-soft/30'} ${message.text ? 'pt-0' : ''}`}>
                {message.mediaType === 'image' && (
                  <img 
                    src={message.mediaUrl} 
                    alt="attachment" 
                    className="max-h-[300px] w-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => window.open(message.mediaUrl, '_blank')}
                  />
                )}
                {message.mediaType === 'video' && (
                  <video 
                    src={message.mediaUrl} 
                    controls 
                    className="max-h-[300px] w-full"
                  />
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
  );
};
