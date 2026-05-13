"use client";

import { useState, useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { ReturnToDashboard } from "@/components/Sidebar";
import {
  Radio,
  Heart,
  Send,
  MessageCircle,
  Users,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Comment {
  id: string;
  text: string;
  authorName: string;
  authorUid: string;
  createdAt: any;
}

// ─── Live dot pulse animation ────────────────────────────────────────────────
const LiveBadge = () => (
  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
    style={{ background: "rgba(220,38,38,0.12)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.3)" }}>
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
    </span>
    Live
  </span>
);

// ─── Floating heart burst ─────────────────────────────────────────────────────
interface FloatingHeart { id: number; x: number }

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LivestreamPage() {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewerCount] = useState(Math.floor(Math.random() * 300) + 120);
  // YouTube ID loaded dynamically from Firestore — admin can change it any time
  const [youtubeStreamId, setYoutubeStreamId] = useState<string>("");
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const heartIdRef = useRef(0);

  // ── Load YouTube ID from Firestore (admin-controlled) ───────────────────
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "livestream_meta", "config"), (snap) => {
      if (snap.exists()) {
        setYoutubeStreamId(snap.data().youtubeId ?? "");
      }
    });
    return unsub;
  }, []);

  // ── Auth listener ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // ── Firestore: real-time comments ─────────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "livestream_comments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
      setComments(data);
    });
    return unsub;
  }, []);

  // ── Firestore: real-time like count ──────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "livestream_meta", "likes"), (snap) => {
      if (snap.exists()) {
        setLikeCount(snap.data().count ?? 0);
      }
    });
    return unsub;
  }, []);

  // ── Check if current user has already liked ───────────────────────────────
  useEffect(() => {
    if (!user) return;
    const checkLike = async () => {
      const snap = await getDoc(doc(db, "livestream_likes", user.uid));
      setHasLiked(snap.exists());
    };
    checkLike();
  }, [user]);

  // ── Auto-scroll comments to bottom ───────────────────────────────────────
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // ── Handle like ──────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!user || hasLiked) return;

    // Optimistic UI
    setHasLiked(true);
    setLikeCount((prev) => prev + 1);

    // Spawn floating heart
    const id = heartIdRef.current++;
    const x = Math.random() * 60 + 20; // 20–80% from left
    setFloatingHearts((prev) => [...prev, { id, x }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1800);

    try {
      await setDoc(doc(db, "livestream_likes", user.uid), { uid: user.uid });
      await setDoc(
        doc(db, "livestream_meta", "likes"),
        { count: increment(1) },
        { merge: true }
      );
    } catch (err) {
      console.error("Like error:", err);
      setHasLiked(false);
      setLikeCount((prev) => prev - 1);
    }
  };

  // ── Handle comment submit ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const text = newComment.trim();
    setNewComment("");

    try {
      await addDoc(collection(db, "livestream_comments"), {
        text,
        authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Comment error:", err);
      setNewComment(text); // restore on failure
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (ts: any) => {
    if (!ts?.seconds) return "";
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getAvatarColor = (uid: string) => {
    const colors = [
      "#D4AF37", "#8B5E3C", "#6B4423", "#A0522D", "#CFAE70",
      "#9C7A3C", "#B8860B", "#CD853F", "#D2691E", "#8B6914",
    ];
    let hash = 0;
    for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-16 pb-10 md:py-20 px-4 md:px-8 overflow-hidden relative">
      <ReturnToDashboard />

      {/* ── Background ambient glows ─────────────────────────────────────── */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[160px]"
          style={{ background: "rgba(212,175,55,0.06)" }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[160px]"
          style={{ background: "rgba(107,68,35,0.07)" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl"
                style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)" }}>
                <Radio size={22} style={{ color: "var(--color-brown-primary)" }} />
              </div>
              <LiveBadge />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold serif"
              style={{ color: "var(--color-brown-primary)" }}>
              Cheerio Live
            </h1>
            <p className="text-sm font-medium uppercase tracking-widest"
              style={{ color: "var(--color-brown-secondary)", opacity: 0.7 }}>
              Watch the event unfold in real-time
            </p>
          </div>

          {/* Viewer count pill */}
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full self-start md:self-auto"
            style={{
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.25)",
              color: "var(--color-brown-primary)",
            }}>
            <Users size={14} />
            <span className="text-xs font-bold tracking-widest">{viewerCount.toLocaleString()} watching</span>
          </div>
        </div>

        {/* ── Main content grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* ── Left: Video + Likes ──────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* YouTube Iframe */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl"
              style={{ border: "1px solid rgba(212,175,55,0.25)" }}>
              <div className="aspect-video w-full">
                {youtubeStreamId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeStreamId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
                    title="Cheerio Live Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                    style={{ display: "block" }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4"
                    style={{ background: "rgba(107,68,35,0.08)" }}>
                    <Radio size={40} style={{ color: "var(--color-gold-primary)", opacity: 0.4 }} />
                    <div className="text-center">
                      <p className="font-bold uppercase tracking-widest text-xs"
                        style={{ color: "var(--color-brown-primary)", opacity: 0.5 }}>
                        Stream not yet configured
                      </p>
                      <p className="text-[10px] mt-1"
                        style={{ color: "var(--color-brown-secondary)", opacity: 0.4 }}>
                        Admin will set the YouTube link before the event
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Gold corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg pointer-events-none"
                style={{ borderColor: "rgba(212,175,55,0.5)" }} />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg pointer-events-none"
                style={{ borderColor: "rgba(212,175,55,0.5)" }} />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg pointer-events-none"
                style={{ borderColor: "rgba(212,175,55,0.5)" }} />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-lg pointer-events-none"
                style={{ borderColor: "rgba(212,175,55,0.5)" }} />
            </div>

            {/* ── Like section ──────────────────────────────────────────── */}
            <div className="relative flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 rounded-[1.5rem]"
              style={{
                background: "var(--color-card-tone)",
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 8px 32px rgba(107,68,35,0.12)",
              }}>

              {/* Floating hearts burst container */}
              <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] pointer-events-none">
                <AnimatePresence>
                  {floatingHearts.map((h) => (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 1, y: 0, scale: 0.8 }}
                      animate={{ opacity: 0, y: -120, scale: 1.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.6, ease: "easeOut" }}
                      className="absolute bottom-6"
                      style={{ left: `${h.x}%` }}
                    >
                      <Heart size={22} fill="#dc2626" stroke="none" className="text-red-500" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleLike}
                  disabled={!user || hasLiked}
                  className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 disabled:cursor-not-allowed"
                  style={hasLiked ? {
                    background: "rgba(220,38,38,0.12)",
                    border: "1px solid rgba(220,38,38,0.35)",
                    color: "#dc2626",
                  } : {
                    background: "rgba(212,175,55,0.12)",
                    border: "1px solid rgba(212,175,55,0.3)",
                    color: "var(--color-brown-primary)",
                  }}
                >
                  <Heart
                    size={16}
                    fill={hasLiked ? "#dc2626" : "none"}
                    className={hasLiked ? "text-red-500" : ""}
                    style={!hasLiked ? { color: "var(--color-brown-primary)" } : {}}
                  />
                  {hasLiked ? "Liked!" : user ? "Like" : "Sign in to like"}
                </motion.button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Heart size={14} fill="#dc2626" stroke="none" />
                  <motion.span
                    key={likeCount}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl sm:text-2xl font-bold serif"
                    style={{ color: "var(--color-brown-primary)" }}
                  >
                    {likeCount.toLocaleString()}
                  </motion.span>
                  <span className="text-[10px] sm:text-xs font-medium uppercase tracking-widest"
                    style={{ color: "var(--color-brown-secondary)", opacity: 0.6 }}>
                    likes
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-medium uppercase tracking-widest"
                style={{ color: "var(--color-brown-secondary)", opacity: 0.5 }}>
                <Sparkles size={14} />
                Show your love
              </div>
            </div>
          </div>

          {/* ── Right: Live Chat ─────────────────────────────────────────── */}
          <div className="flex flex-col rounded-[2rem] overflow-hidden"
            style={{
              background: "var(--color-card-tone)",
              border: "1px solid rgba(212,175,55,0.2)",
              boxShadow: "0 8px 32px rgba(107,68,35,0.12)",
              // Mobile: fixed 400px so it doesn't overflow the viewport
              // Desktop (lg): auto-size to match the video column beside it
              height: "400px",
              maxHeight: "640px",
            }}>

            {/* Chat header */}
            <div className="flex items-center gap-3 px-6 py-4"
              style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
              <MessageCircle size={18} style={{ color: "var(--color-brown-primary)" }} />
              <span className="font-bold uppercase tracking-widest text-xs"
                style={{ color: "var(--color-brown-primary)" }}>
                Live Chat
              </span>
              <span className="ml-auto px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: "rgba(212,175,55,0.15)",
                  color: "var(--color-brown-secondary)",
                  border: "1px solid rgba(212,175,55,0.2)",
                }}>
                {comments.length} messages
              </span>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <MessageCircle size={32} style={{ color: "var(--color-brown-secondary)", opacity: 0.3 }} />
                    <p className="text-xs font-medium uppercase tracking-widest"
                      style={{ color: "var(--color-brown-secondary)", opacity: 0.4 }}>
                      No messages yet. Be the first!
                    </p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-3 items-start group"
                    >
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                        style={{ background: getAvatarColor(c.authorUid) }}
                      >
                        {getInitials(c.authorName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-[11px] font-bold truncate"
                            style={{ color: "var(--color-brown-primary)" }}>
                            {c.authorName}
                          </span>
                          {c.createdAt && (
                            <span className="text-[9px] flex-shrink-0"
                              style={{ color: "var(--color-brown-secondary)", opacity: 0.4 }}>
                              {formatTime(c.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed break-words"
                          style={{ color: "var(--color-theme-text-secondary)" }}>
                          {c.text}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              <div ref={commentsEndRef} />
            </div>

            {/* Comment input */}
            <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
              {user ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Say something..."
                    maxLength={200}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm theme-cinematic-input"
                    style={{ minWidth: 0 }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 disabled:opacity-40"
                    style={{
                      background: "var(--color-gold-primary)",
                      color: "var(--color-theme-text-primary)",
                      border: "none",
                    }}
                  >
                    <Send size={16} />
                  </motion.button>
                </form>
              ) : (
                <div className="text-center py-3">
                  <p className="text-xs font-medium"
                    style={{ color: "var(--color-brown-secondary)", opacity: 0.6 }}>
                    Sign in to join the conversation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer note ─────────────────────────────────────────────────── */}
        <div className="text-center py-8 border-t"
          style={{ borderColor: "rgba(212,175,55,0.1)" }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.8em]"
            style={{ color: "var(--color-brown-secondary)", opacity: 0.3 }}>
            Cheerio 2026 — Live from the stage
          </p>
        </div>
      </div>
    </main>
  );
}
