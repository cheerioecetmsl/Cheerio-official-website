"use client";

import { useState, useEffect } from "react";

export const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-05-14T10:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="text-xl sm:text-2xl md:text-6xl font-bold serif text-gold tabular-nums leading-none">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-[7px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] font-bold text-dark-text/40 mt-1 md:mt-2">
        {label}
      </div>
    </div>
  );

  return (
    <div className="glass-card p-6 md:p-10 rounded-3xl border-gold/20 flex flex-col items-center justify-center space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-700">
      <div className="text-center space-y-1 md:space-y-2">
        <h3 className="text-gold uppercase tracking-widest text-[10px] md:text-xs font-bold">The Final Countdown</h3>
        <p className="serif italic text-[12px] md:text-base text-dark-text/60">Until the Grand Voyage Departs</p>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6 md:gap-16">
        <TimeUnit value={timeLeft.days} label="Days" />
        <div className="text-gold/20 text-lg md:text-4xl serif self-start pt-1 md:pt-2">:</div>
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <div className="text-gold/20 text-lg md:text-4xl serif self-start pt-1 md:pt-2">:</div>
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <div className="text-gold/20 text-lg md:text-4xl serif self-start pt-1 md:pt-2">:</div>
        <TimeUnit value={timeLeft.seconds} label="Secs" />
      </div>

      <div className="h-px w-16 md:w-24 bg-gold/20" />
      <p className="text-[8px] md:text-xs tracking-widest uppercase font-bold text-gold/40">MAY 14, 2026 | 10:00 AM</p>
    </div>
  );
};
