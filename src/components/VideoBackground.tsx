"use client";

import React from 'react';

export const VideoBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#F5F5DC] overflow-hidden">
      {/* Dynamic CSS Particle Fallback */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Parchment Overlay */}
      <div className="absolute inset-0 bg-parchment/40 z-10 backdrop-blur-[2px]" />
      
      {/* Video Element - using local file for reliability */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute w-full h-full object-cover opacity-60 z-5"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      <style jsx>{`
        .animate-pulse {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};
