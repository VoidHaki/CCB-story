import React from "react";

export const CappuccinoSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,87,255,0.2)]">
    <defs>
      <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#d1d5db" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id="coffeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6F4E37" />
        <stop offset="50%" stopColor="#8B5A2B" />
        <stop offset="100%" stopColor="#C4A482" />
      </linearGradient>
      <linearGradient id="foamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFDD0" />
        <stop offset="100%" stopColor="#F5F5DC" />
      </linearGradient>
    </defs>
    
    {/* Steam lines */}
    <g className="opacity-70">
      <path d="M70,55 Q60,35 75,15 T65,0" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" className="animate-steam-1" />
      <path d="M100,50 Q110,30 95,15 T105,0" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" className="animate-steam-2" />
      <path d="M130,55 Q120,35 135,15 T125,0" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" className="animate-steam-3" />
    </g>

    {/* Plate */}
    <ellipse cx="100" cy="155" rx="75" ry="18" fill="url(#cupGrad)" opacity="0.4" />
    <ellipse cx="100" cy="155" rx="60" ry="12" fill="#000" opacity="0.3" />

    {/* Cup Body */}
    <path d="M50,75 C50,130 65,145 100,145 C135,145 150,130 150,75 Z" fill="url(#cupGrad)" />
    
    {/* Handle */}
    <path d="M148,90 C165,90 172,115 148,125" fill="none" stroke="url(#cupGrad)" strokeWidth="10" strokeLinecap="round" />

    {/* Coffee liquid */}
    <ellipse cx="100" cy="75" rx="46" ry="14" fill="url(#coffeeGrad)" />
    
    {/* Foam Heart (Latte Art) */}
    <path d="M100,82 C90,70 78,76 100,68 C122,76 110,70 100,82 Z" fill="url(#foamGrad)" transform="rotate(180 100 75) scale(0.65) translate(-53, -40)" />
    
    {/* Rim Highlight */}
    <ellipse cx="100" cy="74" rx="49" ry="15" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

export const BrownieSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_15px_rgba(229,57,53,0.2)]">
    <defs>
      <linearGradient id="plateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="brownieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3d2314" />
        <stop offset="100%" stopColor="#22130b" />
      </linearGradient>
      <linearGradient id="cherryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff4d4d" />
        <stop offset="100%" stopColor="#990000" />
      </linearGradient>
    </defs>
    
    {/* Plate */}
    <ellipse cx="100" cy="150" rx="80" ry="25" fill="url(#plateGrad)" />
    <ellipse cx="100" cy="150" rx="60" ry="18" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" />

    {/* Brownie 3D Block */}
    {/* Back/Side shadow */}
    <path d="M50,115 L115,85 L150,115 L85,145 Z" fill="#180c07" />
    
    {/* Main Brownie Block */}
    <path d="M50,105 L115,75 L150,105 L85,135 Z" fill="url(#brownieGrad)" />
    
    {/* Side face */}
    <path d="M50,105 L85,135 L85,145 L50,115 Z" fill="#2d190e" />
    <path d="M85,135 L150,105 L150,115 L85,145 Z" fill="#1d1009" />
    
    {/* Texture flakes */}
    <rect x="75" y="95" width="4" height="4" rx="1" fill="#c4a482" opacity="0.6" transform="rotate(12 75 95)" />
    <rect x="110" y="90" width="3" height="3" rx="0.5" fill="#c4a482" opacity="0.5" transform="rotate(-25 110 90)" />
    <rect x="95" y="115" width="5" height="3" rx="1" fill="#ffffff" opacity="0.3" />

    {/* Chocolate Drizzle */}
    <path d="M60,100 Q80,120 100,100 T140,110" fill="none" stroke="#1d1009" strokeWidth="4" strokeLinecap="round" />
    <path d="M70,90 Q95,115 110,95 T145,100" fill="none" stroke="#1d1009" strokeWidth="3" strokeLinecap="round" />

    {/* Cherry on Top */}
    <circle cx="100" cy="85" r="14" fill="url(#cherryGrad)" />
    {/* Highlight */}
    <circle cx="95" cy="80" r="4" fill="#ffffff" opacity="0.8" />
    {/* Stem */}
    <path d="M100,72 Q105,50 120,45" fill="none" stroke="#4a5d23" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const ColdCoffeeSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,87,255,0.2)]">
    <defs>
      <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="coffeeColdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5C4033" />
        <stop offset="100%" stopColor="#3d271d" />
      </linearGradient>
      <linearGradient id="creamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#fbf0e8" />
      </linearGradient>
    </defs>

    {/* Shadow */}
    <ellipse cx="100" cy="175" rx="45" ry="10" fill="#000000" opacity="0.4" />

    {/* Back Straw */}
    <path d="M120,40 L145,10" fill="none" stroke="#E53935" strokeWidth="7" strokeLinecap="round" />
    <path d="M120,40 L95,120" fill="none" stroke="#E53935" strokeWidth="7" />

    {/* Coffee liquid body inside glass */}
    <path d="M68,70 L78,160 C79,165 83,168 88,168 L112,168 C117,168 121,165 122,160 L132,70 Z" fill="url(#coffeeColdGrad)" />
    
    {/* Ice Cubes */}
    <rect x="78" y="90" width="20" height="20" rx="3" fill="#ffffff" opacity="0.25" transform="rotate(15 78 90)" />
    <rect x="102" y="115" width="18" height="18" rx="3" fill="#ffffff" opacity="0.2" transform="rotate(-10 102 115)" />

    {/* Glass Cup Body */}
    <path d="M65,55 L77,163 C78,169 84,173 90,173 L110,173 C116,173 122,169 123,163 L135,55 Z" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
    
    {/* Whipped Cream */}
    <path d="M62,55 C62,40 75,30 100,30 C125,30 138,40 138,55 C138,62 125,68 100,68 C75,68 62,62 62,55 Z" fill="url(#creamGrad)" />
    <path d="M75,45 C75,35 85,25 100,25 C115,25 125,35 125,45 Z" fill="url(#creamGrad)" opacity="0.9" />
    <circle cx="100" cy="20" r="6" fill="#E53935" />

    {/* Chocolate sauce drizzle on cream */}
    <path d="M80,48 Q100,38 120,48" fill="none" stroke="#22130b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M72,55 Q100,48 128,55" fill="none" stroke="#22130b" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

export const PizzaSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_15px_rgba(229,57,53,0.2)]">
    <defs>
      <linearGradient id="crustGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e28743" />
        <stop offset="100%" stopColor="#964b00" />
      </linearGradient>
      <linearGradient id="cheeseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF9A6" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
      <linearGradient id="pepperoniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d32f2f" />
        <stop offset="100%" stopColor="#7f0000" />
      </linearGradient>
    </defs>
    
    {/* Shadow */}
    <ellipse cx="100" cy="165" rx="65" ry="12" fill="#000" opacity="0.4" />

    {/* Pizza Crust */}
    <path d="M40,135 Q100,165 160,135 L100,35 Z" fill="url(#crustGrad)" />
    <path d="M40,135 Q100,165 160,135" fill="none" stroke="#b05e1a" strokeWidth="8" strokeLinecap="round" />

    {/* Cheese Bed */}
    <path d="M46,128 Q100,154 154,128 L100,43 Z" fill="url(#cheeseGrad)" />

    {/* Melted Cheese drops on border */}
    <path d="M55,130 C55,140 62,140 62,130" fill="url(#cheeseGrad)" />
    <path d="M100,140 C100,152 108,152 108,140" fill="url(#cheeseGrad)" />
    <path d="M135,130 C135,142 142,142 142,130" fill="url(#cheeseGrad)" />

    {/* Pepperonis */}
    <circle cx="80" cy="110" r="10" fill="url(#pepperoniGrad)" />
    <circle cx="120" cy="110" r="10" fill="url(#pepperoniGrad)" />
    <circle cx="100" cy="75" r="9" fill="url(#pepperoniGrad)" />
    
    {/* Pepperoni Highlights */}
    <circle cx="77" cy="107" r="3" fill="#ffffff" opacity="0.3" />
    <circle cx="117" cy="107" r="3" fill="#ffffff" opacity="0.3" />
    <circle cx="97" cy="72" r="2.5" fill="#ffffff" opacity="0.3" />

    {/* Basil leaves */}
    <path d="M90,95 Q85,85 95,88 T90,95" fill="#4caf50" />
    <path d="M110,85 Q115,75 105,78 T110,85" fill="#4caf50" transform="rotate(30 110 85)" />
    <path d="M72,125 Q68,118 78,120 T72,125" fill="#4caf50" transform="rotate(-20 72 125)" />
  </svg>
);

export const GiftSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,87,255,0.3)]">
    <defs>
      <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0057FF" />
        <stop offset="100%" stopColor="#001C66" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE000" />
        <stop offset="50%" stopColor="#FFB300" />
        <stop offset="100%" stopColor="#FF8000" />
      </linearGradient>
    </defs>
    
    {/* Glow background */}
    <circle cx="100" cy="110" r="55" fill="rgba(0,87,255,0.15)" filter="blur(10px)" />
    
    {/* Shadow */}
    <ellipse cx="100" cy="170" rx="55" ry="12" fill="#000" opacity="0.5" />

    {/* Box Body */}
    <rect x="55" y="95" width="90" height="65" rx="6" fill="url(#boxGrad)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    
    {/* Box Lid */}
    <rect x="50" y="80" width="100" height="20" rx="4" fill="url(#boxGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

    {/* Golden Ribbon Vertical */}
    <rect x="92" y="80" width="16" height="80" fill="url(#goldGrad)" />

    {/* Golden Ribbon Horizontal */}
    <rect x="55" y="117" width="90" height="14" fill="url(#goldGrad)" />
    <rect x="50" y="83" width="100" height="14" fill="url(#goldGrad)" opacity="0.3" /> {/* shadow */}

    {/* Ribbon Bow on Top */}
    <path d="M100,80 C80,60 70,80 100,80 C120,60 130,80 100,80 Z" fill="url(#goldGrad)" stroke="#b37d00" strokeWidth="0.5" />
    <path d="M100,80 C85,45 60,65 100,80 C115,45 140,65 100,80 Z" fill="url(#goldGrad)" opacity="0.8" />
    
    {/* Ribbon center circle */}
    <circle cx="100" cy="80" r="8" fill="url(#goldGrad)" stroke="#b37d00" strokeWidth="1" />

    {/* Sparkles */}
    <g className="animate-pulse-slow">
      <path d="M40,60 L45,65 L40,70 L35,65 Z" fill="#FFE000" />
      <path d="M165,85 L168,88 L165,91 L162,88 Z" fill="#FFE000" />
      <path d="M150,50 L155,55 L150,60 L145,55 Z" fill="#0057FF" />
      <path d="M60,165 L63,168 L60,171 L57,168 Z" fill="#FFE000" />
    </g>
  </svg>
);

export const CrownSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_20px_rgba(255,224,0,0.35)]">
    <defs>
      <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF275" />
        <stop offset="40%" stopColor="#FFAE00" />
        <stop offset="100%" stopColor="#805B00" />
      </linearGradient>
      <linearGradient id="jewelBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="100%" stopColor="#004D66" />
      </linearGradient>
      <linearGradient id="jewelRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF4D4D" />
        <stop offset="100%" stopColor="#800000" />
      </linearGradient>
    </defs>
    
    {/* Glow Background */}
    <circle cx="100" cy="105" r="50" fill="rgba(255,174,0,0.2)" filter="blur(12px)" />

    {/* Shadow */}
    <ellipse cx="100" cy="160" rx="55" ry="10" fill="#000" opacity="0.4" />

    {/* Crown Base Loop */}
    <path d="M45,130 C45,130 100,142 155,130 L160,140 C160,140 100,154 40,140 Z" fill="url(#crownGold)" />

    {/* Crown Spikes */}
    <path d="M45,130 
             L40,80 
             L75,110 
             L100,60 
             L125,110 
             L160,80 
             L155,130 
             Q100,142 45,130 Z" fill="url(#crownGold)" stroke="#b37d00" strokeWidth="1" />

    {/* Crown Rim Highlight */}
    <path d="M45,130 Q100,142 155,130" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />

    {/* Jewels on Spikes (Circles) */}
    <circle cx="40" cy="80" r="6" fill="url(#jewelBlue)" stroke="#fff" strokeWidth="1" />
    <circle cx="100" cy="60" r="8" fill="url(#jewelRed)" stroke="#fff" strokeWidth="1.5" />
    <circle cx="160" cy="80" r="6" fill="url(#jewelBlue)" stroke="#fff" strokeWidth="1" />

    {/* Embedded Jewels on Base */}
    <rect x="65" y="133" width="8" height="8" rx="2" fill="url(#jewelRed)" transform="rotate(45 69 137)" />
    <circle cx="100" cy="138" r="5" fill="url(#jewelBlue)" />
    <rect x="127" y="133" width="8" height="8" rx="2" fill="url(#jewelRed)" transform="rotate(45 131 137)" />

    {/* Sparkle lines */}
    <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" className="animate-pulse-slow">
      {/* Top sparkle */}
      <line x1="100" y1="44" x2="100" y2="48" />
      <line x1="94" y1="50" x2="98" y2="50" />
      <line x1="102" y1="50" x2="106" y2="50" />
    </g>
  </svg>
);
