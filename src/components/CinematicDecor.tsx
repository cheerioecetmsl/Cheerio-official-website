"use client";
// CinematicDecor.tsx
// Bollywood/Cinema themed SVG decorations scattered across dashboard pages.
// All icons are inline SVG, parchment-toned, semi-transparent.

/* ─── SVG Icon Definitions ──────────────────────────────── */

// Pre-computed: radius 28, center (50,50), angles 0°/60°/120°/180°/240°/300°
const REEL_HOLES: [number, number][] = [
  [78,    50   ],  // 0°
  [64,    74.25],  // 60°
  [36,    74.25],  // 120°
  [22,    50   ],  // 180°
  [36,    25.75],  // 240°
  [64,    25.75],  // 300°
];

const FilmReel = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3.5"/>
    <circle cx="50" cy="50" r="16" fill="currentColor" opacity="0.6"/>
    <circle cx="50" cy="50" r="6"  fill="none" stroke="currentColor" strokeWidth="2.5"/>
    {/* 6 sprocket holes — static coords to avoid SSR/client float mismatch */}
    {REEL_HOLES.map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="7" fill="none" stroke="currentColor" strokeWidth="2.5"/>
    ))}
    {/* Film strip tail */}
    <path d="M88 62 Q104 68 108 80 Q112 92 100 96" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <line x1="89" y1="66" x2="92" y2="74" stroke="currentColor" strokeWidth="2"/>
    <line x1="94" y1="68" x2="97" y2="76" stroke="currentColor" strokeWidth="2"/>
    <line x1="99" y1="70" x2="102" y2="78" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const Clapperboard = () => (
  <svg viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Main body */}
    <rect x="8" y="28" width="94" height="58" rx="5" stroke="currentColor" strokeWidth="3.5"/>
    {/* Lines inside */}
    <line x1="8"  y1="48" x2="102" y2="48" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    <line x1="8"  y1="62" x2="102" y2="62" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    <text x="16" y="44" fontSize="7" fill="currentColor" opacity="0.7" fontFamily="monospace">PRODUCTION</text>
    <text x="16" y="57" fontSize="7" fill="currentColor" opacity="0.7" fontFamily="monospace">DIRECTOR</text>
    <text x="16" y="72" fontSize="7" fill="currentColor" opacity="0.7" fontFamily="monospace">CAMERA</text>
    {/* Top clapper bar */}
    <rect x="8" y="8" width="94" height="24" rx="4" fill="currentColor" opacity="0.85"/>
    {/* White stripes on clapper */}
    {[18,34,50,66,82].map((x, i) => (
      <polygon key={i}
        points={`${x},8 ${x+10},8 ${x+4},32 ${x-6},32`}
        fill="white" opacity="0.3"
      />
    ))}
    {/* Hinge */}
    <circle cx="10" cy="20" r="4" fill="none" stroke="white" strokeWidth="2" opacity="0.6"/>
  </svg>
);

const VintageCamera = () => (
  <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Body */}
    <rect x="18" y="20" width="72" height="52" rx="6" stroke="currentColor" strokeWidth="3.5"/>
    {/* Lens */}
    <circle cx="54" cy="46" r="18" stroke="currentColor" strokeWidth="3"/>
    <circle cx="54" cy="46" r="12" stroke="currentColor" strokeWidth="2"/>
    <circle cx="54" cy="46" r="6"  fill="currentColor" opacity="0.5"/>
    {/* Film magazine on top */}
    <rect x="32" y="8" width="28" height="14" rx="3" stroke="currentColor" strokeWidth="3"/>
    <circle cx="46" cy="15" r="5" fill="currentColor" opacity="0.4"/>
    {/* Viewfinder */}
    <rect x="82" y="26" width="24" height="14" rx="3" stroke="currentColor" strokeWidth="2.5"/>
    {/* Tripod mount */}
    <line x1="40" y1="72" x2="34" y2="86" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <line x1="54" y1="72" x2="54" y2="88" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <line x1="68" y1="72" x2="74" y2="86" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    {/* Handle knobs */}
    <circle cx="84" cy="48" r="4" fill="currentColor" opacity="0.6"/>
    <circle cx="84" cy="60" r="3" fill="currentColor" opacity="0.5"/>
  </svg>
);

const PopcornBucket = () => (
  <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Bucket */}
    <path d="M15 38 L8 90 L72 90 L65 38 Z" stroke="currentColor" strokeWidth="3" fill="none"/>
    {/* Stripes */}
    <line x1="26" y1="38" x2="20" y2="90" stroke="currentColor" strokeWidth="6" opacity="0.35"/>
    <line x1="40" y1="38" x2="40" y2="90" stroke="currentColor" strokeWidth="6" opacity="0.35"/>
    <line x1="54" y1="38" x2="60" y2="90" stroke="currentColor" strokeWidth="6" opacity="0.35"/>
    {/* Rim */}
    <rect x="12" y="34" width="56" height="8" rx="2" fill="currentColor" opacity="0.7"/>
    {/* Popcorn kernels */}
    <circle cx="20" cy="26" r="9" fill="currentColor" opacity="0.7"/>
    <circle cx="38" cy="18" r="10" fill="currentColor" opacity="0.8"/>
    <circle cx="58" cy="24" r="9" fill="currentColor" opacity="0.7"/>
    <circle cx="29" cy="14" r="7" fill="currentColor" opacity="0.6"/>
    <circle cx="50" cy="12" r="7" fill="currentColor" opacity="0.65"/>
    <circle cx="40" cy="28" r="6" fill="currentColor" opacity="0.5"/>
  </svg>
);

const MovieTicket = () => (
  <svg viewBox="0 0 120 55" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Ticket body */}
    <rect x="4" y="4" width="112" height="47" rx="5" stroke="currentColor" strokeWidth="3"/>
    {/* Perforation */}
    <line x1="84" y1="4" x2="84" y2="51" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"/>
    {/* Circles cutout on perforation */}
    <circle cx="84" cy="4"  r="5" fill="white" stroke="currentColor" strokeWidth="2"/>
    <circle cx="84" cy="51" r="5" fill="white" stroke="currentColor" strokeWidth="2"/>
    {/* ADMIT text */}
    <text x="14" y="24" fontSize="11" fill="currentColor" fontFamily="monospace" fontWeight="bold" opacity="0.8">ADMIT</text>
    <text x="14" y="40" fontSize="9"  fill="currentColor" fontFamily="monospace" opacity="0.65">ONE</text>
    {/* Star */}
    <text x="50" y="34" fontSize="18" fill="currentColor" opacity="0.6">★</text>
    {/* Stub number */}
    <text x="89" y="34" fontSize="8" fill="currentColor" fontFamily="monospace" opacity="0.6">2026</text>
  </svg>
);

const DirectorChair = () => (
  <svg viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Back legs */}
    <line x1="16" y1="10" x2="8"  y2="108" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    <line x1="74" y1="10" x2="82" y2="108" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    {/* Front legs */}
    <line x1="24" y1="46" x2="12" y2="108" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    <line x1="66" y1="46" x2="78" y2="108" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    {/* Cross brace */}
    <line x1="12" y1="84" x2="78" y2="84" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
    {/* Seat */}
    <path d="M22 46 Q45 52 68 46" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"/>
    {/* Back rest fabric */}
    <path d="M14 10 L20 42 Q45 48 70 42 L76 10 Z" fill="currentColor" opacity="0.35"/>
    <line x1="14" y1="10" x2="76" y2="10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
    {/* DIRECTOR label */}
    <text x="22" y="27" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold" opacity="0.9">DIRECTOR</text>
  </svg>
);

const Glasses3D = () => (
  <svg viewBox="0 0 110 50" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Bridge */}
    <line x1="44" y1="22" x2="66" y2="22" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    {/* Left lens */}
    <rect x="6" y="8" width="38" height="28" rx="8" stroke="currentColor" strokeWidth="3"/>
    <rect x="10" y="12" width="30" height="20" rx="5" fill="currentColor" opacity="0.2"/>
    {/* Right lens */}
    <rect x="66" y="8" width="38" height="28" rx="8" stroke="currentColor" strokeWidth="3"/>
    <rect x="70" y="12" width="30" height="20" rx="5" fill="currentColor" opacity="0.2"/>
    {/* Arms */}
    <line x1="6"   y1="22" x2="0"   y2="22" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <line x1="104" y1="22" x2="110" y2="22" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    {/* Lens shine */}
    <line x1="14" y1="15" x2="18" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <line x1="74" y1="15" x2="78" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const Megaphone = () => (
  <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Cone body */}
    <path d="M8 28 L8 52 L62 68 L62 12 Z" stroke="currentColor" strokeWidth="3" fill="currentColor" opacity="0.25" strokeLinejoin="round"/>
    {/* Mouthpiece */}
    <rect x="2" y="30" width="10" height="20" rx="3" stroke="currentColor" strokeWidth="3"/>
    {/* Handle grip lines */}
    <line x1="22" y1="20" x2="22" y2="60" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    <line x1="30" y1="18" x2="30" y2="62" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    {/* Sound waves */}
    <path d="M68 28 Q80 40 68 52" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M74 20 Q94 40 74 60" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M80 13 Q106 40 80 67" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const FilmStrip = () => (
  <svg viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Main strip */}
    <rect x="4" y="4" width="132" height="52" rx="4" stroke="currentColor" strokeWidth="3"/>
    {/* Top sprocket holes */}
    {[14,34,54,74,94,114].map((x, i) => (
      <rect key={`t${i}`} x={x} y="8"  width="12" height="8" rx="2" fill="currentColor" opacity="0.6"/>
    ))}
    {/* Bottom sprocket holes */}
    {[14,34,54,74,94,114].map((x, i) => (
      <rect key={`b${i}`} x={x} y="44" width="12" height="8" rx="2" fill="currentColor" opacity="0.6"/>
    ))}
    {/* Frames */}
    <rect x="8"  y="20" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.12"/>
    <rect x="42" y="20" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.12"/>
    <rect x="76" y="20" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.12"/>
    <rect x="110"y="20" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.12"/>
  </svg>
);

const DrinkCup = () => (
  <svg viewBox="0 0 70 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Cup body */}
    <path d="M10 22 L16 88 L54 88 L60 22 Z" stroke="currentColor" strokeWidth="3" fill="none" strokeLinejoin="round"/>
    {/* Stripes */}
    <line x1="22" y1="22" x2="18" y2="88" stroke="currentColor" strokeWidth="5" opacity="0.25"/>
    <line x1="35" y1="22" x2="35" y2="88" stroke="currentColor" strokeWidth="5" opacity="0.25"/>
    <line x1="48" y1="22" x2="52" y2="88" stroke="currentColor" strokeWidth="5" opacity="0.25"/>
    {/* Lid */}
    <ellipse cx="35" cy="22" rx="27" ry="5" stroke="currentColor" strokeWidth="3" fill="currentColor" opacity="0.4"/>
    <ellipse cx="35" cy="18" rx="16" ry="3" stroke="currentColor" strokeWidth="2" fill="none"/>
    {/* Straw */}
    <line x1="42" y1="2" x2="38" y2="19" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    {/* Bottom */}
    <ellipse cx="35" cy="88" rx="20" ry="4" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.25"/>
  </svg>
);

/* ─── Icon Map ──────────────────────────────────────────── */

const ICONS: Record<string, React.FC> = {
  reel: FilmReel,
  clap: Clapperboard,
  cam: VintageCamera,
  pop: PopcornBucket,
  ticket: MovieTicket,
  chair: DirectorChair,
  glasses: Glasses3D,
  mega: Megaphone,
  strip: FilmStrip,
  cup: DrinkCup,
};

/* ─── Scatter Config ────────────────────────────────────── */
// top/left as viewport % for fixed positioning,
// size in px, rotation in deg, opacity

const PLACEMENTS = [
  // ── Top-left region
  { icon: 'reel',    top:  4, left: 10, size: 90,  rot: -15, op: 0.10 },
  { icon: 'clap',   top:  8, left: 22, size: 75,  rot:  18, op: 0.09 },
  { icon: 'strip',  top: 14, left:  6, size: 130, rot:  -8, op: 0.08 },
  // ── Top-center
  { icon: 'pop',    top:  3, left: 40, size: 72,  rot:  12, op: 0.10 },
  { icon: 'ticket', top:  8, left: 52, size: 95,  rot: -20, op: 0.09 },
  { icon: 'mega',   top:  5, left: 66, size: 85,  rot:  25, op: 0.10 },
  // ── Top-right
  { icon: 'cam',    top:  3, left: 80, size: 100, rot: -10, op: 0.09 },
  { icon: 'glasses',top: 12, left: 75, size: 90,  rot:  30, op: 0.10 },
  { icon: 'cup',    top:  6, left: 91, size: 65,  rot: -22, op: 0.09 },
  // ── Left side mid
  { icon: 'chair',  top: 28, left:  4, size: 88,  rot:   8, op: 0.10 },
  { icon: 'reel',   top: 40, left:  8, size: 78,  rot:  42, op: 0.09 },
  { icon: 'strip',  top: 52, left:  5, size: 120, rot: -18, op: 0.08 },
  // ── Center-left
  { icon: 'clap',   top: 30, left: 28, size: 82,  rot: -35, op: 0.08 },
  { icon: 'ticket', top: 45, left: 32, size: 100, rot:  15, op: 0.09 },
  { icon: 'pop',    top: 58, left: 25, size: 70,  rot:  -5, op: 0.08 },
  // ── Center
  { icon: 'cam',    top: 35, left: 48, size: 95,  rot:  20, op: 0.07 },
  { icon: 'glasses',top: 52, left: 55, size: 88,  rot: -28, op: 0.08 },
  { icon: 'mega',   top: 66, left: 44, size: 80,  rot:  38, op: 0.09 },
  // ── Center-right
  { icon: 'chair',  top: 28, left: 70, size: 85,  rot: -12, op: 0.09 },
  { icon: 'reel',   top: 44, left: 78, size: 92,  rot:  22, op: 0.10 },
  { icon: 'strip',  top: 60, left: 68, size: 110, rot: -14, op: 0.08 },
  // ── Right side
  { icon: 'cup',    top: 32, left: 90, size: 68,  rot:  16, op: 0.09 },
  { icon: 'clap',   top: 48, left: 88, size: 80,  rot: -40, op: 0.09 },
  { icon: 'ticket', top: 65, left: 84, size: 96,  rot:  10, op: 0.10 },
  // ── Bottom row
  { icon: 'pop',    top: 78, left: 12, size: 72,  rot:  -8, op: 0.09 },
  { icon: 'mega',   top: 82, left: 38, size: 85,  rot:  28, op: 0.10 },
  { icon: 'cam',    top: 76, left: 60, size: 98,  rot: -18, op: 0.09 },
  { icon: 'glasses',top: 84, left: 80, size: 86,  rot:  35, op: 0.10 },
  { icon: 'reel',   top: 80, left: 95, size: 78,  rot: -25, op: 0.09 },
];

/* ─── Component ─────────────────────────────────────────── */

export function CinematicDecor() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[50] overflow-hidden"
    >
      {PLACEMENTS.map((p, i) => {
        const Icon = ICONS[p.icon];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top:      `${p.top}%`,
              left:     `${p.left}%`,
              width:    `${p.size}px`,
              height:   `${p.size}px`,
              transform:`rotate(${p.rot}deg)`,
              opacity:   p.op,
              color:    'var(--color-brown-primary)',
            }}
          >
            <Icon />
          </div>
        );
      })}
    </div>
  );
}
