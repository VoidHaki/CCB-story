"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Coffee, Award, Sparkles, ChevronLeft, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

// 12-sector array of rewards matching the backend api precisely
const TABLET_WHEEL_REWARDS = [
  { text: "+25 Coins",    type: "coins",    value: 25,           icon: "🪙", color: "#1E2E56", textColor: "#FFFFFF" },
  { text: "10% Off",      type: "discount", value: "10%",        icon: "🏷️", color: "#F4F6F9", textColor: "#1E2E56" },
  { text: "+20 Coins",    type: "coins",    value: 20,           icon: "🪙", color: "#D91F3A", textColor: "#FFFFFF" },
  { text: "Free Coffee",  type: "food",     value: "Free Coffee",icon: "☕", color: "#C07D34", textColor: "#FFFFFF" },
  { text: "+15 Coins",    type: "coins",    value: 15,           icon: "🪙", color: "#1E2E56", textColor: "#FFFFFF" },
  { text: "+30 Coins",    type: "coins",    value: 30,           icon: "🪙", color: "#F4F6F9", textColor: "#1E2E56" },
  { text: "+20 Coins",    type: "coins",    value: 20,           icon: "🪙", color: "#D91F3A", textColor: "#FFFFFF" },
  { text: "Free Brownie", type: "food",     value: "Free Brownie",icon: "🍫", color: "#C07D34", textColor: "#FFFFFF" },
  { text: "+10 Coins",    type: "coins",    value: 10,           icon: "🪙", color: "#1E2E56", textColor: "#FFFFFF" },
  { text: "15% Off",      type: "discount", value: "15%",        icon: "🏷️", color: "#F4F6F9", textColor: "#1E2E56" },
  { text: "+15 Coins",    type: "coins",    value: 15,           icon: "🪙", color: "#D91F3A", textColor: "#FFFFFF" },
  { text: "+5 Coins",     type: "coins",    value: 5,            icon: "🪙", color: "#C07D34", textColor: "#FFFFFF" },
];

export default function TabletWheelPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wheelSize, setWheelSize] = useState(480);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinsCount, setSpinsCount] = useState(0);
  const [activeReward, setActiveReward] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Responsive sizes for tablet screens
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const minDimension = Math.min(w, h);
      
      if (minDimension < 360) {
        setWheelSize(260);
      } else if (minDimension < 500) {
        setWheelSize(310);
      } else if (minDimension < 768) {
        setWheelSize(420);
      } else {
        setWheelSize(500);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Web Audio Synth alerts
  const playSynthSound = (type: "tick" | "win" | "click") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;

      if (type === "tick") {
        // High quality crisp tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.05);
      } else if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.08);
      } else if (type === "win") {
        // Grand celebratory chime chord arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major
        notes.forEach((freq, idx) => {
          const noteTime = now + idx * 0.08;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          // Mix sine and triangle for luxury tone
          osc.type = idx % 2 === 0 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq, noteTime);
          
          gain.gain.setValueAtTime(0.15, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(noteTime);
          osc.stop(noteTime + 0.8);
        });
      }
    } catch (e) {
      console.error("Audio synth error:", e);
    }
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 2;
    const size = wheelSize;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 14;

    ctx.clearRect(0, 0, size, size);

    // 1. Outer deep luxury gold 3D drop shadow rim
    ctx.save();
    ctx.shadowColor = "rgba(13, 26, 56, 0.12)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();

    // 2. Heavy polished metallic Gold rim frame
    const rimGrad = ctx.createRadialGradient(cx, cy, radius - 4, cx, cy, radius + 10);
    rimGrad.addColorStop(0, "#C8903A");      // Dark Gold
    rimGrad.addColorStop(0.2, "#FFDF85");    // Bright Shimmer
    rimGrad.addColorStop(0.45, "#966A1E");   // Metallic shadow
    rimGrad.addColorStop(0.7, "#FFDF85");    // Highlight
    rimGrad.addColorStop(0.9, "#B5812B");    // Base Gold
    rimGrad.addColorStop(1, "#69490F");      // Dark bevel edge

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 14;
    ctx.stroke();

    // Inner gold border accent ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Slices rendering
    const anglePerSlice = 360 / TABLET_WHEEL_REWARDS.length;
    TABLET_WHEEL_REWARDS.forEach((reward, i) => {
      const startAngle = (i * anglePerSlice - 90) * Math.PI / 180;
      const endAngle = ((i + 1) * anglePerSlice - 90) * Math.PI / 180;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius - 4, startAngle, endAngle);
      ctx.closePath();

      // Radially gradient slice colors for metallic sheen
      let grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
      if (reward.color === "#1E2E56") {
        grad.addColorStop(0, "#2B4075");
        grad.addColorStop(1, "#0A1329");
      } else if (reward.color === "#D91F3A") {
        grad.addColorStop(0, "#F23554");
        grad.addColorStop(1, "#940F22");
      } else if (reward.color === "#C07D34") {
        grad.addColorStop(0, "#E5A952");
        grad.addColorStop(1, "#8A5313");
      } else { // white
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(1, "#E1E6EB");
      }

      ctx.fillStyle = grad;
      ctx.fill();

      // Golden boundary lines between slices
      ctx.strokeStyle = "rgba(200, 144, 58, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Slice content (Text & Icon)
      ctx.save();
      ctx.translate(cx, cy);
      const textAngle = (i * anglePerSlice + anglePerSlice / 2 - 90) * Math.PI / 180;
      ctx.rotate(textAngle);

      ctx.fillStyle = reward.textColor;
      // Bold larger font for tablet display
      const fontSize = Math.max(10, Math.min(14, Math.floor(size / 30)));
      ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(reward.text, radius - 38, 0);

      // Icon offset
      ctx.font = "16px sans-serif";
      ctx.fillText(reward.icon, radius - 16, 0);

      ctx.restore();
    });

    // Outer rim lights
    const lightsCount = 24;
    for (let i = 0; i < lightsCount; i++) {
      const angle = (i * 360 / lightsCount) * Math.PI / 180;
      const lx = cx + (radius + 3) * Math.cos(angle);
      const ly = cy + (radius + 3) * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "#FFFBD6" : "#FFC72C";
      ctx.fill();
      
      // Light shadow glow
      ctx.shadowColor = "#FFDF85";
      ctx.shadowBlur = 6;
    }

  }, [wheelSize]);

  // Handle Server-based Tablet Spin
  const handleSpinWheel = async () => {
    if (isSpinning) return;
    playSynthSound("click");

    try {
      const res = await fetch("/api/spin/tablet", {
        method: "POST"
      });

      if (!res.ok) {
        alert("Server error starting spin. Please try again.");
        return;
      }

      const spinData = await res.json();
      const winnerIndex = spinData.rewardIndex;

      // Spin physics calculations
      const segmentAngle = 30; // 360 / 12
      const offsetAngle = segmentAngle / 2;
      const targetDegrees = 360 - (winnerIndex * segmentAngle + offsetAngle);
      const nextSpinsCount = spinsCount + 1;
      // 8 full spins + target segment offsets
      const totalRotation = nextSpinsCount * 2880 + targetDegrees;

      setIsSpinning(true);
      setSpinsCount(nextSpinsCount);
      setWheelRotation(totalRotation);

      // Audible wheel ticking sounds during rotation
      let ticks = 0;
      const totalTicks = 45;
      const runTicking = () => {
        if (ticks < totalTicks) {
          playSynthSound("tick");
          ticks++;
          // Decay ticks velocity over time to mimic natural friction slowing down
          const delay = 60 + Math.pow(ticks / totalTicks, 2) * 550;
          setTimeout(runTicking, delay);
        }
      };
      setTimeout(runTicking, 50);

      // Landing window
      setTimeout(() => {
        setIsSpinning(false);
        setActiveReward(spinData.reward);
        setShowCelebration(true);
        playSynthSound("win");
        
        // Confetti burst
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
      }, 6200);

    } catch (e) {
      console.error(e);
      alert("Unable to initiate lucky wheel spin.");
    }
  };

  const handleNextCustomer = () => {
    playSynthSound("click");
    setShowCelebration(false);
    setActiveReward(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-navy flex flex-col font-sans relative overflow-hidden bg-grid">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-red/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] aspect-square rounded-full bg-gold/5 blur-[120px] pointer-events-none z-0"></div>

      {/* HEADER SECTION */}
      <header className="z-10 px-8 py-6 flex items-center justify-between border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin"
            className="p-3 rounded-xl bg-white border border-gray-200 hover:border-red/40 text-navy hover:text-red transition-all flex items-center justify-center cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="block text-[9px] font-black text-red uppercase tracking-widest leading-none">Café Coffee Break</span>
            <h1 className="text-lg font-black text-navy uppercase tracking-wider mt-1.5 leading-none">Tablet Lucky Wheel</h1>
          </div>
        </div>

        {/* Live Status Tag & Sound Control */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-xl bg-white border border-gray-200 text-navy hover:text-red hover:border-red/30 transition-all cursor-pointer shadow-sm"
            title="Toggle Sounds"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-red" /> : <VolumeX className="w-5 h-5 text-navy/50" />}
          </button>
          <span className="px-4 py-2 rounded-xl bg-red/5 text-red border border-red/20 text-[10px] font-black uppercase tracking-widest shadow-sm">
            Kiosk Mode
          </span>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 z-10 relative">
        <div className="text-center mb-8 max-w-xl">
          <h2 className="text-4xl font-black font-serif text-navy uppercase tracking-wider">
            Lucky Brew Draw
          </h2>
          <p className="text-xs text-gray-600 mt-3.5 leading-relaxed font-semibold">
            Café reward drawing. Spin the wheel to win CCB coins or high-value café vouchers instantly!
          </p>
        </div>

        {/* WHEEL DRAW AREA */}
        <div className="relative p-6 select-none">
          {/* Metallic Gold rim frame */}
          <div className="relative rounded-full" style={{
            boxShadow: "0 25px 70px rgba(30, 46, 86, 0.15), 0 0 0 10px rgba(200, 144, 58, 0.1)"
          }}>
            {/* Rotating Canvas Wrapper */}
            <div 
              className="rounded-full overflow-hidden relative"
              style={{ 
                transform: `rotate(${wheelRotation}deg)`, 
                transition: isSpinning ? "transform 6s cubic-bezier(0.15, 0.85, 0.15, 1)" : "none"
              }}
            >
              <canvas ref={canvasRef} />
            </div>

            <button 
              onClick={handleSpinWheel}
              disabled={isSpinning}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 border-navy shadow-2xl transition-all select-none hover:scale-105 active:scale-95 disabled:opacity-90 disabled:cursor-not-allowed"
              style={{
                background: "radial-gradient(circle at 35% 35%, #FFFFFF 0%, #FFF5CC 40%, #C8903A 80%, #8A5A00 100%)",
                boxShadow: "inset 0 4px 8px rgba(255, 255, 255, 0.9), 0 8px 24px rgba(0, 0, 0, 0.4)"
              }}
            >
              <span className="text-[10px] font-black text-navy uppercase tracking-widest leading-none">SPIN</span>
              <span className="text-[8px] text-red font-black mt-0.5 tracking-wider">NOW</span>
            </button>

            {/* Glowing Pointer Pointer */}
            <div 
              className="absolute top-[-16px] left-1/2 transform -translate-x-1/2 z-30"
              style={{
                width: 0,
                height: 0,
                borderLeft: "14px solid transparent",
                borderRight: "14px solid transparent",
                borderTop: "28px solid #D91F3A",
                filter: "drop-shadow(0 6px 12px rgba(217, 31, 58, 0.6))"
              }}
            >
              <div className="absolute top-[-30px] left-[-9px] w-[18px] height-[18px] rounded-full bg-[#D91F3A] border-2 border-white shadow-md"></div>
            </div>

            {/* Glass Overlay Light Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/5 to-white/15 mix-blend-overlay pointer-events-none z-10"></div>
          </div>
        </div>

        {/* BOTTOM HELPER INSCRIPTION */}
        <span className="mt-8 text-[10px] font-bold text-navy/40 uppercase tracking-widest">
          Controlled by Café Staff • No timer restrictions
        </span>
      </main>

      {/* FULLSCREEN CELEBRATION WINNER CARD */}
      <AnimatePresence>
        {showCelebration && activeReward && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-darker/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-lg p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden rounded-[36px] border border-gray-200 bg-white"
              style={{
                boxShadow: "0 30px 80px rgba(30, 46, 86, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 0 0 1px rgba(200, 144, 58, 0.15)"
              }}
            >
              {/* Sparkle background decoration */}
              <div className="absolute inset-0 opacity-10 bg-radial-gradient pointer-events-none"></div>

              {/* Gold Winner Crest Icon */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gold to-gold-light p-1 shadow-xl mb-8 relative">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-5xl border border-gold/10">
                  {activeReward.icon}
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red flex items-center justify-center text-[10px] shadow-md border border-white">
                  🏆
                </div>
              </div>

              {/* Title Header */}
              <span className="text-[11px] font-black text-red uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-gold anim-float" />
                <span>Winner Announcement</span>
                <Sparkles className="w-3.5 h-3.5 text-gold anim-float" />
              </span>

              <h2 className="text-2xl sm:text-4xl font-black font-serif text-navy mb-4 tracking-wide leading-tight">
                CONGRATULATIONS!
              </h2>

              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-gold to-transparent mb-8"></div>

              <span className="text-navy/40 text-[10px] uppercase font-black tracking-widest mb-1.5">Your Reward</span>
              <div className="text-3xl sm:text-5xl font-black font-serif text-gold mb-6 tracking-wide drop-shadow-sm">
                {activeReward.reward}
              </div>

              <p className="text-xs text-gray-600 max-w-sm leading-relaxed mb-10 font-semibold">
                Please present this screen to the cashier or your waiter to claim your treat instantly!
              </p>

              {/* NEXT CUSTOMER BUTTON */}
              <button 
                onClick={handleNextCustomer}
                className="w-full py-4 gold-btn text-xs uppercase tracking-widest font-black shadow-2xl border-none hover:scale-102 transition-transform active:scale-98"
                style={{
                  boxShadow: "0 10px 30px rgba(200, 144, 58, 0.3)"
                }}
              >
                ✨ Next Customer
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
