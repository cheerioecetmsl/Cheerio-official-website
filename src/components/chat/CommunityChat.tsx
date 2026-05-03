"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocs, 
  startAfter,
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { ChatMessage, sendMessage, TypingStatus } from '@/lib/chat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Loader2, Users, Shield, AlertCircle, ChevronDown, MessageSquare } from 'lucide-react';

interface CommunityChatProps {
  currentUser: any;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<any>(null);
  const isInitialLoad = useRef(true);

  // Check Admin and Muted status
  useEffect(() => {
    if (!currentUser?.uid) return;

    const checkStatus = async () => {
      const adminDoc = await getDoc(doc(db, 'admin_emails', currentUser.email || ''));
      setIsAdmin(adminDoc.exists());

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setIsMuted(data.isMuted || false);
        if (data.isBanned) {
          window.location.href = '/banned';
        }
      }
    };

    checkStatus();
  }, [currentUser]);

  // Listen to messages (Latest 50)
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage)).reverse();

      setMessages(newMessages);
      setLoading(false);

      if (isInitialLoad.current) {
        setTimeout(scrollToBottom, 100);
        isInitialLoad.current = false;
      }

      if (snapshot.docs.length > 0) {
        firstMessageRef.current = snapshot.docs[snapshot.docs.length - 1];
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to typing status
  useEffect(() => {
    const q = query(collection(db, 'typing'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typing = snapshot.docs
        .map(doc => doc.data() as TypingStatus)
        .filter(t => t.userId !== currentUser?.uid && t.isTyping);
      setTypingUsers(typing);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: isInitialLoad.current ? 'auto' : 'smooth'
      });
    }
  };

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 200;
    setShowScrollButton(!isNearBottom);

    if (target.scrollTop === 0 && hasMore && !loadingOlder && firstMessageRef.current) {
      loadOlderMessages();
    }
  };

  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMore || !firstMessageRef.current) return;

    setLoadingOlder(true);
    const prevHeight = scrollRef.current?.scrollHeight || 0;

    try {
      const q = query(
        collection(db, 'messages'),
        orderBy('createdAt', 'desc'),
        startAfter(firstMessageRef.current),
        limit(30)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMore(false);
      } else {
        const olderMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ChatMessage)).reverse();

        setMessages(prev => [...olderMessages, ...prev]);
        firstMessageRef.current = snapshot.docs[snapshot.docs.length - 1];

        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevHeight;
          }
        }, 0);
      }
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleSendMessage = async (text: string, media?: { url: string; type: 'image' | 'video' | 'file' }) => {
    if (!currentUser) return;

    let finalUserData = userData;
    if (!finalUserData) {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        finalUserData = userDoc.data();
      }
    }

    await sendMessage(
      {
        uid: currentUser.uid,
        name: finalUserData?.name || finalUserData?.displayName || currentUser.displayName || 'Anonymous',
        photoURL: finalUserData?.photoURL || currentUser.photoURL || '',
        photoBaseId: finalUserData?.photoBaseId || '',
        role: isAdmin ? 'admin' : 'user'
      },
      { text, mediaUrl: media?.url, mediaType: media?.type }
    );
    setTimeout(scrollToBottom, 100);
  };

  // Group messages for better UI
  const groupedMessages = messages.reduce((acc: any[], msg, i) => {
    const prevMsg = messages[i - 1];
    const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
    
    acc.push({
      ...msg,
      isFirstInGroup
    });
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 bg-parchment-base">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-gold" />
          <div className="absolute inset-0 blur-xl bg-gold/20 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-brown-primary tracking-tight serif">Consulting the Ledger</p>
          <p className="text-xs text-brown-secondary/60 uppercase tracking-[0.2em]">Synchronizing community vibes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-parchment-base relative overflow-hidden font-sans">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none select-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      {/* Modern Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-parchment-contrast/80 backdrop-blur-2xl border-b border-gold-soft/30 z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold-primary shadow-lg shadow-gold/5">
              <Users className="text-gold-primary" size={20} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 border-2 border-parchment-contrast" />
          </div>
          <div>
            <h2 className="font-bold text-brown-primary text-base sm:text-lg tracking-tight serif">Global Community</h2>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] font-bold text-gold-primary uppercase tracking-widest">Live Archive</span>
              <span className="hidden sm:inline text-[10px] text-brown-secondary/30">•</span>
              <span className="hidden sm:inline text-[10px] text-brown-secondary/60 font-medium">152 online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gold/10 border border-gold-primary/30 backdrop-blur-md">
              <Shield size={12} className="text-gold-primary" />
              <span className="text-[9px] sm:text-[10px] font-bold text-gold-primary uppercase tracking-wider">Custodian</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area - Centered Column */}
    <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-2 sm:px-0"
      >
        <div className="max-w-[900px] mx-auto w-full px-2 sm:px-4 py-4 sm:py-8 flex flex-col min-h-full">
          {loadingOlder && (
            <div className="flex justify-center py-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">History...</span>
              </div>
            </div>
          )}
          
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-700">
              <div className="w-20 h-20 rounded-full bg-parchment-contrast flex items-center justify-center mb-6 border border-gold-soft/30">
                <MessageSquare className="text-gold-primary/40" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-brown-primary serif mb-2">No messages yet</h3>
              <p className="text-brown-secondary/60 text-sm max-w-[200px]">Start the conversation and leave your mark on the ledger. 👋</p>
            </div>
          ) : (
            <div className="space-y-1">
              {!hasMore && (
                <div className="flex flex-col items-center gap-3 py-10 opacity-30">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent via-brown-primary to-transparent" />
                  <p className="text-[10px] font-bold text-brown-primary uppercase tracking-[0.3em]">Origin Point Reached</p>
                  <div className="h-px w-20 bg-gradient-to-r from-transparent via-brown-primary to-transparent" />
                </div>
              )}

              {groupedMessages.map((msg, idx) => (
                <div 
                  key={msg.id} 
                  className={`${msg.isFirstInGroup && idx !== 0 ? 'mt-4' : 'mt-1'} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <MessageBubble 
                    message={msg} 
                    isMe={msg.senderId === currentUser?.uid}
                    isAdmin={isAdmin}
                    isFirstInGroup={msg.isFirstInGroup}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="sticky bottom-0 left-0 right-0 py-4 mt-auto">
              <div className="flex items-center gap-3 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-parchment-contrast/90 border border-gold-soft/30 backdrop-blur-md w-fit animate-in slide-in-from-left duration-300 shadow-lg">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-brown-primary uppercase tracking-wider">
                  {(() => {
                    const names = typingUsers.map(u => u.name.split(' ')[0]);
                    if (names.length === 1) return `${names[0]} is typing...`;
                    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
                    if (names.length === 3) return `${names[0]}, ${names[1]} and ${names[2]} are typing...`;
                    return `${names[0]}, ${names[1]} and ${names.length - 2} others are typing...`;
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Down Button */}
      {showScrollButton && (
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-24 sm:bottom-28 right-4 sm:right-8 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gold text-black shadow-2xl shadow-gold/20 hover:bg-gold-glow transition-all hover:scale-110 z-30 active:scale-95"
        >
          <ChevronDown size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
        </button>
      )}

      {/* Chat Input */}
      <div className="relative z-20 px-2 sm:px-4 pb-4 sm:pb-6 pt-2 bg-gradient-to-t from-parchment-base to-transparent">
        <div className="max-w-[900px] mx-auto w-full">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            user={{ uid: currentUser?.uid, displayName: currentUser?.displayName || 'Anonymous' }}
            isMuted={isMuted}
          />
        </div>
      </div>
    </div>
  );
};
