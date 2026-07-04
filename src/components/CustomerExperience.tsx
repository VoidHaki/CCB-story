"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Coffee, 
  Receipt, 
  Star, 
  Volume2, 
  VolumeX, 
  Check, 
  X,
  Bell,
  Sparkles,
  Coins,
  ArrowRight,
  ChevronRight,
  Lock,
  Clock,
  Gift,
  Award,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface CustomerExperienceProps {
  defaultTableId: string | null;
}

const CUSTOMER_SCENES = [
  { url: "/gallery/story_scene_1.png", name: "Harsh Rajpurohit", reward: "Free Cappuccino", review: "Fun rewards. Got my first cappuccino free." },
  { url: "/gallery/story_scene_2.png", name: "Khushi Rathore", reward: "Chocolate Brownie", review: "The warm brownie reward was delicious." },
  { url: "/gallery/story_scene_15.png", name: "Rohan Gehlot", reward: "Pizza Reward", review: "Collected enough coins for a free pizza." },
  { url: "/gallery/story_scene_4.png", name: "Muskan Choudhary", reward: "Cold Coffee", review: "Simple QR scan. Enter code, get rewards." },
  { url: "/gallery/story_scene_5.png", name: "Yashvardhan Singh", reward: "Loaded Fries", review: "Redeemed loaded fries. Best hangout spot." },
  { url: "/gallery/story_scene_6.png", name: "Divya Kanwar", reward: "Garlic Bread", review: "Great vibe. The garlic bread was tasty." }
];

// Unified 12 rewards matching the backend spin handler exactly (index 0 to 11)
const WHEEL_REWARDS = [
  { text: "+5 Coins",     type: "coins",    value: 5,            icon: "🪙", color: "#1E2E56", textColor: "#FFFFFF" },
  { text: "10% Off",      type: "discount", value: "10%",        icon: "🏷️", color: "#F4F6F9", textColor: "#1E2E56" },
  { text: "+10 Coins",    type: "coins",    value: 10,           icon: "🪙", color: "#D91F3A", textColor: "#FFFFFF" },
  { text: "Free Coffee",  type: "food",     value: "Free Coffee",icon: "☕", color: "#C07D34", textColor: "#FFFFFF" },
  { text: "+15 Coins",    type: "coins",    value: 15,           icon: "🪙", color: "#1E2E56", textColor: "#FFFFFF" },
  { text: "Mystery Gift", type: "mystery",  value: "Mystery Gift",icon: "🎁", color: "#F4F6F9", textColor: "#1E2E56" },
  { text: "+20 Coins",    type: "coins",    value: 20,           icon: "🪙", color: "#D91F3A", textColor: "#FFFFFF" },
  { text: "Free Brownie", type: "food",     value: "Free Brownie",icon: "🍰", color: "#C07D34", textColor: "#FFFFFF" },
  { text: "+25 Coins",    type: "coins",    value: 25,           icon: "🪙", color: "#1E2E56", textColor: "#FFFFFF" },
  { text: "15% Off",      type: "discount", value: "15%",        icon: "🏷️", color: "#F4F6F9", textColor: "#1E2E56" },
  { text: "Lucky Bonus",  type: "bonus",    value: 50,           icon: "✨", color: "#D91F3A", textColor: "#FFFFFF" },
  { text: "Better Luck!", type: "luck",     value: "Better Luck",icon: "🍀", color: "#C07D34", textColor: "#FFFFFF" }
];

// Lazy-loading video component to optimize network bandwidth and prevent first-load lag
function ReelVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(video);
    return () => {
      observer.unobserve(video);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={isInView ? src : undefined}
      preload="none"
      muted
      loop
      playsInline
      className="w-full h-full object-cover"
    />
  );
}

export default function CustomerExperience({ defaultTableId }: CustomerExperienceProps) {
  const [tableId, setTableId] = useState<string>("12");
  const [availableTables, setAvailableTables] = useState<{id: string; name: string}[]>([]);
  
  // Media configuration
  const [mediaList, setMediaList] = useState<{logo: string[]; gallery: string[]; reels: string[]; media: string[]}>({
    logo: [],
    gallery: [],
    reels: [],
    media: []
  });
  
  // Interactive UI states
  const [activeModal, setActiveModal] = useState<"table-select" | null>(null);
  const [toastMessage, setToastMessage] = useState<{text: string; type: "success" | "info"} | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calling States
  const [waiterCallStatus, setWaiterCallStatus] = useState<"idle" | "calling" | "success">("idle");
  const [billCallStatus, setBillCallStatus] = useState<"idle" | "calling" | "success">("idle");
  const [waiterCountdown, setWaiterCountdown] = useState(3);
  const [billCountdown, setBillCountdown] = useState(3);

  const waiterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const billIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated Coins
  const [simulatedCoins, setSimulatedCoins] = useState<number>(0);
  const [coinsList, setCoinsList] = useState<{ id: number; x: number; y: number }[]>([]);

  // Cooldown states
  const [canSpin, setCanSpin] = useState<boolean>(true);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0); // in ms
  const [tableRewards, setTableRewards] = useState<any[]>([]);

  // Spin & Win Wheel States
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [activeSpinReward, setActiveSpinReward] = useState<{
    id: string;
    reward: string;
    rewardType: string;
    rewardValue: string | number;
    icon: string;
    token: string;
    expiresAt?: string;
  } | null>(null);
  const [showSpinPopup, setShowSpinPopup] = useState(false);
  const [spinsCount, setSpinsCount] = useState(0);
  const [notifiedStaffForReward, setNotifiedStaffForReward] = useState<boolean>(false);

  // Dynamic Wheel Sizing
  const [wheelSize, setWheelSize] = useState(320);

  const spinSectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Listen to screen width changes to scale the wheel
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 340) {
        setWheelSize(230);
      } else if (width < 380) {
        setWheelSize(260);
      } else if (width < 480) {
        setWheelSize(290);
      } else if (width < 640) {
        setWheelSize(320);
      } else {
        setWheelSize(360);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (defaultTableId) {
      setTableId(String(defaultTableId));
    }
  }, [defaultTableId]);

  const loadConfig = async () => {
    try {
      const tablesRes = await fetch("/api/tables");
      if (tablesRes.ok) {
        const tablesData = await tablesRes.json();
        setAvailableTables(tablesData);
        if (!defaultTableId && tablesData.length > 0) {
          setTableId(tablesData[0].id);
        }
      }
    } catch (e) {
      console.error("Error loading tables", e);
    }

    try {
      const mediaRes = await fetch("/api/media");
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMediaList(mediaData);
      }
    } catch (e) {
      console.error("Error loading media", e);
    }
  };

  // Cooldown status and active table rewards sync
  const checkStatusAndLoadRewards = async (tId: string) => {
    if (!tId) return;
    try {
      // 1. Fetch spin status (cooldown + active pending reward)
      const statusRes = await fetch(`/api/spin/status?tableId=${tId}`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setCanSpin(statusData.canSpin);
        setCooldownRemaining(statusData.cooldownRemaining);
        
        if (statusData.activePendingReward) {
          const isDismissed = sessionStorage.getItem(`ccb_dismissed_reward_${statusData.activePendingReward.id}`) === "true";
          setActiveSpinReward(statusData.activePendingReward);
          setNotifiedStaffForReward(false);
          if (!isDismissed) {
            setShowSpinPopup(true);
          }
        }
      }

      // 2. Fetch all rewards won at this table
      const rewardsRes = await fetch(`/api/spin?tableId=${tId}`);
      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json();
        // Filter out luck rewards from display history
        const filteredRewards = rewardsData.filter((r: any) => r.rewardType !== "luck");
        setTableRewards(filteredRewards);
      }
    } catch (e) {
      console.error("Error syncing spin status and rewards:", e);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [defaultTableId]);

  useEffect(() => {
    if (tableId) {
      checkStatusAndLoadRewards(tableId);
    }
  }, [tableId]);

  // Live timer interval for cooldown ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1000) {
          if (prev > 0 && tableId) {
            checkStatusAndLoadRewards(tableId);
          }
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [tableId]);

  // Unlock AudioContext for client-side audio alerts under autoplay restrictions
  useEffect(() => {
    const unlock = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        // Play a very short silent note to warm up context
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(ctx.currentTime + 0.01);
      } catch (e) {
        console.error("Audio autoplay unlock failed:", e);
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // Audio system
  const playSynthSound = (type: "click" | "success" | "tick") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      if (type === "click") {
        osc1.frequency.setValueAtTime(500, ctx.currentTime);
        gain1.gain.setValueAtTime(0.015, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.04);
      } else if (type === "tick") {
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(800, ctx.currentTime);
        gain1.gain.setValueAtTime(0.005, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.02);
      } else if (type === "success") {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.type = "sine";
        osc2.type = "sine";

        osc1.frequency.setValueAtTime(880, ctx.currentTime); 
        osc2.frequency.setValueAtTime(1100, ctx.currentTime); 

        gain1.gain.setValueAtTime(0.02, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        gain2.gain.setValueAtTime(0.01, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.5);
        osc2.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (text: string, type: "success" | "info" = "info") => {
    setToastMessage({ text, type });
    playSynthSound("success");
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Waiter Countdown Trigger
  const startWaiterCall = () => {
    playSynthSound("click");
    setWaiterCallStatus("calling");
    setWaiterCountdown(3);
    
    waiterIntervalRef.current = setInterval(() => {
      setWaiterCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(waiterIntervalRef.current!);
          dispatchWaiterCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelWaiterCall = () => {
    playSynthSound("click");
    if (waiterIntervalRef.current) clearInterval(waiterIntervalRef.current);
    setWaiterCallStatus("idle");
    showToast("Call canceled", "info");
  };

  const dispatchWaiterCall = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, type: "Waiter Call" })
      });
      if (res.ok) {
        setWaiterCallStatus("success");
        showToast("Waiter has been called!", "success");
        setTimeout(() => setWaiterCallStatus("idle"), 4000);
      } else {
        setWaiterCallStatus("idle");
        showToast("Unable to reach staff. Please try again.", "info");
      }
    } catch (e) {
      setWaiterCallStatus("idle");
      showToast("Connection lost. Reconnecting...", "info");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bill Countdown Trigger
  const startBillCall = () => {
    playSynthSound("click");
    setBillCallStatus("calling");
    setBillCountdown(3);
    
    billIntervalRef.current = setInterval(() => {
      setBillCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(billIntervalRef.current!);
          dispatchBillCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelBillCall = () => {
    playSynthSound("click");
    if (billIntervalRef.current) clearInterval(billIntervalRef.current);
    setBillCallStatus("idle");
    showToast("Bill request canceled", "info");
  };

  const dispatchBillCall = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, type: "Ask For Bill" })
      });
      if (res.ok) {
        setBillCallStatus("success");
        showToast("Bill receipt requested!", "success");
        setTimeout(() => setBillCallStatus("idle"), 4000);
      } else {
        setBillCallStatus("idle");
        showToast("Unable to submit request. Please try again.", "info");
      }
    } catch (e) {
      setBillCallStatus("idle");
      showToast("Connection lost. Reconnecting...", "info");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTableName = () => {
    const table = availableTables.find(t => t.id === tableId);
    return table ? table.name : `Table ${tableId}`;
  };

  const handleScrollToSpin = () => {
    playSynthSound("click");
    spinSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Premium Wheel Canvas Drawing
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
    const radius = size / 2 - 12;

    ctx.clearRect(0, 0, size, size);

    // 1. Shadow overlay
    ctx.save();
    ctx.shadowColor = "rgba(30, 46, 86, 0.3)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = "#132247";
    ctx.fill();
    ctx.restore();

    // 2. Metallic brass gold rim border
    const rimGrad = ctx.createRadialGradient(cx, cy, radius - 4, cx, cy, radius + 8);
    rimGrad.addColorStop(0, "#C8903A");
    rimGrad.addColorStop(0.3, "#F5D080");
    rimGrad.addColorStop(0.5, "#AA7C11");
    rimGrad.addColorStop(0.8, "#F5D080");
    rimGrad.addColorStop(1, "#8A5A00");

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 9;
    ctx.stroke();

    // Inner gold border accent ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Slices rendering
    const anglePerSlice = 360 / WHEEL_REWARDS.length;
    WHEEL_REWARDS.forEach((reward, i) => {
      const startAngle = (i * anglePerSlice - 90) * Math.PI / 180;
      const endAngle = ((i + 1) * anglePerSlice - 90) * Math.PI / 180;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius - 3, startAngle, endAngle);
      ctx.closePath();

      let grad;
      if (reward.color === "#1E2E56") {
        grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
        grad.addColorStop(0, "#233566");
        grad.addColorStop(1, "#0D1A38");
      } else if (reward.color === "#D91F3A") {
        grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
        grad.addColorStop(0, "#E8304A");
        grad.addColorStop(1, "#A81426");
      } else if (reward.color === "#C07D34") {
        grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
        grad.addColorStop(0, "#D99E32");
        grad.addColorStop(1, "#8F6010");
      } else {
        grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(1, "#EEF2F6");
      }

      ctx.fillStyle = grad;
      ctx.fill();

      // Sharp golden boundary lines between slices
      ctx.strokeStyle = "rgba(200, 144, 58, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Slice contents (radial aligned text)
      ctx.save();
      ctx.translate(cx, cy);
      const textAngle = (i * anglePerSlice + anglePerSlice / 2 - 90) * Math.PI / 180;
      ctx.rotate(textAngle);

      ctx.fillStyle = reward.textColor;
      const fontSize = Math.max(9, Math.min(12, Math.floor(size / 30)));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(reward.text, radius - 28, 0);

      // Icon offset
      ctx.font = "14px sans-serif";
      ctx.fillText(reward.icon, radius - 11, 0);

      ctx.restore();
    });

    // Outer rim lights
    const lights = 24;
    for (let i = 0; i < lights; i++) {
      const angle = (i * 360 / lights) * Math.PI / 180;
      const lx = cx + (radius + 2) * Math.cos(angle);
      const ly = cy + (radius + 2) * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "#FFF5CC" : "#FFC233";
      ctx.fill();
    }

  }, [wheelSize, mediaList]);

  // Handle Server-based Secure Spin
  const handleSpinWheel = async () => {
    if (isSpinning || !canSpin) return;
    playSynthSound("click");

    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId })
      });

      if (!res.ok) {
        const errorData = await res.json();
        showToast(errorData.error || "Spin unavailable. Please try again.", "info");
        checkStatusAndLoadRewards(tableId);
        return;
      }

      const rewardData = await res.json();
      const winnerIndex = rewardData.rewardIndex;

      // 7 full spins + offset calculation to land chosen slice under top pointer
      const segmentAngle = 30; // 360 / 12
      const offsetAngle = segmentAngle / 2;
      const targetDegrees = 360 - (winnerIndex * segmentAngle + offsetAngle);
      const nextSpinsCount = spinsCount + 1;
      const totalRotation = nextSpinsCount * 2520 + targetDegrees;

      setIsSpinning(true);
      setSpinsCount(nextSpinsCount);
      setWheelRotation(totalRotation);

      // Audio ticking
      let ticks = 0;
      const tickInterval = setInterval(() => {
        if (ticks < 32) {
          playSynthSound("tick");
          ticks++;
        } else {
          clearInterval(tickInterval);
        }
      }, 150);

      setTimeout(() => {
        clearInterval(tickInterval);
        setIsSpinning(false);

        // Confetti for all wins
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.65 },
          colors: ["#D91F3A", "#1E2E56", "#C8903A", "#FFFFFF"]
        });

        // Clear dismissed flag for new reward
        sessionStorage.removeItem(`ccb_dismissed_reward_${rewardData.id}`);

        setActiveSpinReward({
          id: rewardData.id,
          reward: rewardData.reward,
          rewardType: rewardData.rewardType,
          rewardValue: rewardData.rewardValue,
          icon: rewardData.icon,
          token: rewardData.token,
          expiresAt: rewardData.expiresAt
        });
        setNotifiedStaffForReward(false);
        setShowSpinPopup(true);
        playSynthSound("success");
        
        // Refresh status and history
        checkStatusAndLoadRewards(tableId);
      }, 6000);

    } catch (e) {
      console.error("Spin request error", e);
      showToast("Connection lost. Reconnecting...", "info");
    }
  };

  // Securely Bank Coins
  const handleBankCoins = async () => {
    if (!activeSpinReward) return;
    
    try {
      const res = await fetch("/api/spin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeSpinReward.id, action: "claim" })
      });

      if (res.ok) {
        setShowSpinPopup(false);
        playSynthSound("success");

        const coinsAmount = typeof activeSpinReward.rewardValue === "number" 
          ? activeSpinReward.rewardValue 
          : parseInt(activeSpinReward.rewardValue as string) || 15;
        
        // Flying coins animation setup
        const newCoins = Array.from({ length: Math.min(coinsAmount, 15) }).map((_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 200 - 100, 
          y: Math.random() * -120 - 45   
        }));

        setCoinsList(newCoins);
        setSimulatedCoins((prev) => prev + coinsAmount);
        setTimeout(() => setCoinsList([]), 1200);

        showToast(`Banked +${coinsAmount} Coins!`, "success");
        setActiveSpinReward(null);
        checkStatusAndLoadRewards(tableId);
      } else {
        const err = await res.json();
        showToast(err.error || "Unable to save reward. Please try again.", "info");
      }
    } catch (e) {
      showToast("Unable to save reward. Please try again.", "info");
    }
  };

  // Claim & Activate Discount / Voucher
  const handleCollectVoucher = async (rewardId?: string) => {
    const targetId = rewardId || activeSpinReward?.id;
    if (!targetId) return;

    try {
      const res = await fetch("/api/spin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetId, action: "claim" })
      });

      if (res.ok) {
        if (!rewardId) {
          setShowSpinPopup(false);
          setActiveSpinReward(null);
        }
        showToast("Reward successfully saved.", "success");
        checkStatusAndLoadRewards(tableId);
      } else {
        const err = await res.json();
        showToast(err.error || "Unable to save reward. Please try again.", "info");
      }
    } catch (e) {
      showToast("Unable to save reward. Please try again.", "info");
    }
  };

  // Staff calling specifically for reward verification code
  const handleCallStaffForReward = async () => {
    if (!activeSpinReward || notifiedStaffForReward) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tableId, 
          type: `Reward Claim - ${activeSpinReward.reward} (${activeSpinReward.id.split("-")[2] || "Spin"})`
        })
      });
      if (res.ok) {
        setNotifiedStaffForReward(true);
        playSynthSound("success");
        showToast("Staff has been notified.", "success");
      } else {
        showToast("Unable to notify staff. Please try again.", "info");
      }
    } catch (e) {
      showToast("Connection lost. Reconnecting...", "info");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format cooldown ms into readable HH:MM:SS
  const formatCooldown = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getFriendlyStatus = (status: string) => {
    switch(status) {
      case "pending": return "Pending";
      case "claimed": return "Redeemed";
      case "rejected": return "Rejected";
      case "expired": return "Expired";
      default: return status;
    }
  };

  const reels = mediaList.reels && mediaList.reels.length > 0 ? mediaList.reels : [];

  return (
    <div className="min-h-screen bg-white text-navy flex flex-col font-sans select-none pb-12 relative overflow-hidden bg-grid">
      
      {/* HEADER SECTION */}
      <header className="fixed top-0 inset-x-0 z-40 bg-navy-deep px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col gap-2 shadow-lg border-b border-white/5">
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
          
          {/* Logo Area */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img 
              src="/logo/ccb new (1).png" 
              alt="Café Coffee Break" 
              className="h-9 sm:h-11 w-auto object-contain rounded-lg border border-white/10"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-extrabold text-xs sm:text-sm tracking-widest text-red uppercase font-sans">Café Coffee Break</span>
              <span className="text-[7.5px] text-white/40 tracking-wider uppercase font-semibold font-mono mt-0.5">Est. 2016 • Jodhpur</span>
            </div>
          </div>

          {/* Action trigger area */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <button 
              id="table-select-trigger"
              onClick={() => { 
                if (!defaultTableId) {
                  playSynthSound("click"); 
                  setActiveModal("table-select"); 
                }
              }}
              className={`flex items-center gap-1.5 bg-white/10 border border-white/10 text-white px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-bold text-[10px] sm:text-xs transition-all ${
                defaultTableId 
                  ? "opacity-90 cursor-default" 
                  : "hover:border-red/30 active:scale-95 cursor-pointer"
              }`}
            >
              {defaultTableId ? (
                <Lock className="w-3 h-3 text-red-light" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse"></span>
              )}
              <span>{getTableName()}</span>
            </button>

            <button 
              onClick={() => { setSoundEnabled(!soundEnabled); if(!soundEnabled) setTimeout(() => playSynthSound("success"), 50); }}
              className="p-1.5 sm:p-2 rounded-full bg-white/10 border border-white/10 text-white/80 hover:text-white hover:border-red/30 transition-all focus:outline-none"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-red" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <a 
              href="https://ccbrewards.in"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSynthSound("click")}
              className="bg-red hover:bg-red-light text-white text-[9px] sm:text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1 sm:gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Coins className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span className="hidden xs:inline sm:inline">Spend Coins</span>
              <span className="xs:hidden sm:hidden">Spend</span>
            </a>
          </div>
        </div>

        {/* Secondary Sub Navigation */}
        <div className="flex justify-center gap-8 border-t border-white/10 pt-2 pb-0.5 text-[9px] font-black uppercase tracking-widest w-full max-w-4xl mx-auto">
          <a href="https://ccbrewards.in" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">Home</a>
          <a href="https://ccbrewards.in/redeem" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">Redeem</a>
          <a href="https://ccbrewards.in/marketplace" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">Market</a>
        </div>
      </header>

      {/* REELS SECTION (INSTAGRAM-STYLE AUTO-PLAYING VERTICAL VIDEOS) */}
      <section className="relative w-full pt-32 pb-4 px-4 max-w-4xl mx-auto z-20">
        <div className="mb-4 pl-1">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-red bg-red/5 px-2.5 py-0.5 rounded-full border border-red/10 inline-block mb-1.5">
            Dine-In Reels 🎬
          </span>
          <h3 className="text-sm font-black text-navy uppercase tracking-wider">Atmosphere Reels</h3>
        </div>

        {reels.length > 0 ? (
          <div className="flex overflow-x-auto justify-start sm:justify-center gap-4 snap-x snap-mandatory hide-scrollbar pb-3 px-1 -mx-4 sm:mx-0 sm:px-0 w-full">
            {reels.map((reelFile, idx) => (
              <div 
                key={idx}
                className="w-[160px] sm:w-[200px] aspect-[9/16] relative flex-shrink-0 snap-start rounded-2xl overflow-hidden border border-slate-200/80 shadow-md active:scale-98 transition-transform duration-300 bg-navy-deep group/reel"
              >
                {/* Lazy-loaded video optimized using IntersectionObserver */}
                <ReelVideo src={`/reels/${reelFile}`} />
                
                {/* Visual vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                  <span className="text-[8px] font-black uppercase text-white tracking-widest drop-shadow">CCB Live</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ccb-card p-12 flex flex-col items-center justify-center text-center text-navy/40">
            <Coffee className="w-10 h-10 animate-bounce text-red mb-2" />
            <span className="text-xs font-bold uppercase tracking-wider">No reels loaded</span>
            <span className="text-[10px] mt-1">Place vertical MP4 files in public/reels/ to list them here.</span>
          </div>
        )}
      </section>

      {/* THREE MAIN PREMIUM ACTION CARDS */}
      <section className="px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto w-full z-20">
        
        {/* CALL WAITER CARD */}
        <motion.button
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (waiterCallStatus === "idle") startWaiterCall();
            else if (waiterCallStatus === "calling") cancelWaiterCall();
          }}
          disabled={isSubmitting || waiterCallStatus === "success"}
          className={`ccb-card p-6 flex flex-col justify-between items-start text-left focus:outline-none relative overflow-hidden min-h-[170px] w-full cursor-pointer shadow-lg hover:shadow-xl transition-all ${
            waiterCallStatus === "calling" ? "anim-calling border-red/60" : ""
          } ${waiterCallStatus === "success" ? "anim-success border-emerald-500/60" : ""}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
            waiterCallStatus === "calling" ? "bg-red/10" : "bg-navy/5"
          }`}>
            <Bell className={`w-6 h-6 ${
              waiterCallStatus === "calling" ? "text-red animate-bounce" : "text-navy anim-bell"
            }`} />
          </div>
          <div>
            {waiterCallStatus === "idle" && (
              <>
                <span className="block text-base font-extrabold text-navy uppercase tracking-wider">Call Waiter</span>
                <span className="block text-[10px] text-gray-600 mt-1 font-semibold leading-relaxed">Request staff hospitality at Table {tableId}</span>
              </>
            )}
            {waiterCallStatus === "calling" && (
              <>
                <span className="block text-base font-extrabold text-red uppercase tracking-wider">Calling... ({waiterCountdown}s)</span>
                <span className="block text-[10px] text-red mt-1 font-bold underline animate-pulse">Tap here to cancel call</span>
              </>
            )}
            {waiterCallStatus === "success" && (
              <>
                <span className="block text-base font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 anim-pulse-ring-green"></span>
                  <span>Notified</span>
                </span>
                <span className="block text-[10px] text-gray-600 mt-1 font-semibold">Staff is on their way</span>
              </>
            )}
          </div>
        </motion.button>

        {/* ASK FOR BILL CARD */}
        <motion.button
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (billCallStatus === "idle") startBillCall();
            else if (billCallStatus === "calling") cancelBillCall();
          }}
          disabled={isSubmitting || billCallStatus === "success"}
          className={`ccb-card p-6 flex flex-col justify-between items-start text-left focus:outline-none relative overflow-hidden min-h-[170px] w-full cursor-pointer shadow-lg hover:shadow-xl transition-all ${
            billCallStatus === "calling" ? "anim-calling border-red/60" : ""
          } ${billCallStatus === "success" ? "anim-success border-emerald-500/60" : ""}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center mb-4">
            <Receipt className={`w-6 h-6 text-navy ${billCallStatus === "calling" ? "animate-bounce" : "anim-receipt"}`} />
          </div>
          <div>
            {billCallStatus === "idle" && (
              <>
                <span className="block text-base font-extrabold text-navy uppercase tracking-wider">Ask For Bill</span>
                <span className="block text-[10px] text-gray-600 mt-1 font-semibold leading-relaxed">Request printed table check & checkout code</span>
              </>
            )}
            {billCallStatus === "calling" && (
              <>
                <span className="block text-base font-extrabold text-red uppercase tracking-wider">Calling... ({billCountdown}s)</span>
                <span className="block text-[10px] text-red mt-1 font-bold underline animate-pulse">Tap here to cancel check</span>
              </>
            )}
            {billCallStatus === "success" && (
              <>
                <span className="block text-base font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 anim-pulse-ring-green"></span>
                  <span>Requested</span>
                </span>
                <span className="block text-[10px] text-gray-600 mt-1 font-semibold">Checking checkout code bill</span>
              </>
            )}
          </div>
        </motion.button>

        {/* LUCKY BREW (SCROLL DOWN TARGET) */}
        <motion.button
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleScrollToSpin}
          className="ccb-card p-6 flex flex-col justify-between items-start text-left focus:outline-none relative overflow-hidden min-h-[170px] w-full cursor-pointer shadow-lg hover:shadow-xl border-red/20 bg-gradient-to-br from-white via-white to-red/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-red/10 flex items-center justify-center mb-4 group-hover:bg-red/15 transition-colors">
            <Sparkles className="w-6 h-6 text-red anim-sparkle" />
          </div>
          <div>
            <span className="block text-base font-extrabold text-navy uppercase tracking-wider flex items-center gap-1">
              <span>Lucky Brew</span>
              <ArrowRight className="w-4 h-4 text-red group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="block text-[10px] text-gray-600 mt-1 font-semibold leading-relaxed">Spin our lucky brew loyalty wheel for certified café vouchers</span>
          </div>
        </motion.button>

      </section>

      {/* FLYING COINS COMPONENT */}
      <div className="relative w-full max-w-4xl mx-auto z-50 pointer-events-none">
        <AnimatePresence>
          {coinsList.map((coin) => (
            <motion.div
              key={coin.id}
              initial={{ x: 0, y: 150, opacity: 1, scale: 0.6 }}
              animate={{ 
                x: coin.x, 
                y: coin.y - 120, 
                opacity: 0,
                scale: 1.4
              }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 z-50"
            >
              <svg viewBox="0 0 100 100" className="w-9 h-9 drop-shadow-[0_4px_8px_rgba(200,144,58,0.4)]">
                <circle cx="50" cy="50" r="40" fill="#FFB300" stroke="#C8903A" strokeWidth="3" />
                <text x="51" y="60" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="950" fontFamily="sans-serif">C</text>
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PREMIUM WHEEL SECTION */}
      <section ref={spinSectionRef} className="py-12 sm:py-16 px-3 sm:px-6 max-w-4xl mx-auto w-full z-20 bg-gray-bg border-y border-gray-200 rounded-[24px] sm:rounded-[32px] my-6 sm:my-10 shadow-inner relative">
        
        {/* Floating Coin Decoration */}
        <div className="absolute right-6 top-8 opacity-25 anim-coin pointer-events-none hidden sm:block">
          <svg viewBox="0 0 100 100" className="w-12 h-12">
            <circle cx="50" cy="50" r="40" fill="#FFB300" stroke="#C8903A" strokeWidth="2.5" />
            <text x="51" y="60" textAnchor="middle" fill="#FFFFFF" fontSize="26" fontWeight="bold">C</text>
          </svg>
        </div>

        <div className="text-center mb-8">
          <span className="section-label mb-2">Lucky Brew Draw</span>
          <h2 className="text-3xl font-black font-serif text-navy tracking-tight mt-1">Spin & Win</h2>
          <p className="text-[11px] text-gray-600 mt-2 max-w-md mx-auto leading-relaxed font-semibold">
            Vouchers won from this lucky wheel are instantly generated on our server for dine-in checkout! Bank coins to buy real treats at <a href="https://ccbrewards.in" target="_blank" rel="noopener noreferrer" className="text-red font-bold underline">ccbrewards.in</a>.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-2xl mx-auto">
          
          {/* 3D LUXURY WHEEL AREA */}
          <div className="relative flex-shrink-0 p-2 sm:p-4">
            
            {/* 3D Outer drop ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-navy/30 via-transparent to-transparent blur-md"></div>
            
            {/* Metallic Gold rim frame */}
            <div className="wheel-container">
              
              {/* Rotating Canvas Element */}
              <div 
                className="rounded-full overflow-hidden relative"
                style={{ 
                  transform: `rotate(${wheelRotation}deg)`, 
                  transition: isSpinning ? "transform 6s cubic-bezier(0.1, 0.8, 0.1, 1)" : "none"
                }}
              >
                <canvas ref={canvasRef} />
              </div>

              {/* Glossy glass reflection overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/5 to-white/20 mix-blend-overlay pointer-events-none z-10"></div>
              
              {/* Top Red Pointer Arrow */}
              <div className="wheel-pointer"></div>

              {/* Center Glossy 3D Gold Button */}
              <button 
                onClick={handleSpinWheel}
                disabled={isSpinning || !canSpin}
                className="wheel-center-cap disabled:opacity-80 disabled:cursor-not-allowed"
              >
                <span className="text-[8px] font-black text-navy tracking-widest leading-none">SPIN</span>
                <span className="text-[6px] text-red font-black mt-0.5 tracking-wider">NOW</span>
              </button>

            </div>
          </div>

          {/* SIMULATED ACCOUNT BALANCE & SPIN TRIGGERS */}
          <div className="flex flex-col gap-4 w-full max-w-[280px]">
            <div className="ccb-card p-6 flex flex-col items-center text-center shadow-md bg-white border-gray-200">
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5">Simulated Wallet Balance</span>
              
              <div className="flex items-center gap-2 justify-center mb-1">
                <svg viewBox="0 0 100 100" className="w-8 h-8">
                  <circle cx="50" cy="50" r="40" fill="#FFB300" stroke="#C8903A" strokeWidth="3" />
                  <text x="51" y="60" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="950" fontFamily="sans-serif">C</text>
                </svg>
                <span className="text-3xl font-black text-navy font-mono leading-none">{simulatedCoins}</span>
              </div>
              <span className="text-[9px] text-gray-600 font-bold">Coins ready to bank</span>
              
              <div className="w-full border-t border-gray-100 my-4 pt-3.5">
                {cooldownRemaining > 0 ? (
                  <div className="flex flex-col items-center p-2.5 bg-red/5 border border-red/10 rounded-xl">
                    <span className="text-[8px] font-black text-red uppercase tracking-wider mb-1">Spin Cooldown Active</span>
                    <span className="text-[9px] text-gray-600 font-semibold mb-1">Next spin available in:</span>
                    <span className="text-lg font-black font-mono text-red tracking-wider glow-text">
                      {formatCooldown(cooldownRemaining)}
                    </span>
                  </div>
                ) : (
                  <span className="text-[9.5px] text-gray-600 font-semibold leading-relaxed block">
                    Spin once every 2 hours. Win coins or exclusive café discounts instantly!
                  </span>
                )}
              </div>
              
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning || !canSpin}
                className="w-full py-3 btn-red text-xs uppercase tracking-widest font-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSpinning ? "Brewing Spin..." : "SPIN BREW WHEEL"}
              </button>
            </div>
          </div>

        </div>

        {/* ACTIVE TABLE REWARDS LISTING PANEL */}
        {tableRewards.length > 0 && (
          <div className="w-full max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-200 rounded-3xl shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-gray-100">
              <Gift className="w-5 h-5 text-red" />
              <div>
                <h4 className="text-xs font-black text-navy uppercase tracking-wider">Rewards Won at Table {tableId}</h4>
                <span className="text-[8.5px] text-gray-500 font-semibold uppercase">Manage and activate dine-in discount codes</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {tableRewards.map((reward) => {
                const now = Date.now();
                const expiryTime = new Date(reward.expiresAt).getTime();
                const isExpired = expiryTime < now && reward.status === "pending";
                const displayStatus = isExpired ? "expired" : reward.status;
                const timeLeft = Math.max(0, expiryTime - now);
                
                return (
                  <div 
                    key={reward.id}
                    className="p-3 bg-gray-bg border border-gray-200/60 rounded-2xl flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <div>
                        <span className="block font-black text-navy uppercase tracking-wide">{reward.reward}</span>
                        <span className="block text-[8px] text-gray-500 font-mono mt-0.5 uppercase">ID: {reward.id.split("-")[2]}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Expire / Status timer */}
                      {displayStatus === "pending" && (
                        <div className="flex flex-col items-end text-[9px] font-mono text-gray-600">
                          <span className="text-[7.5px] font-sans font-bold text-red uppercase tracking-wider">Expires in</span>
                          <span className="font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-red" />
                            <span>{formatCooldown(timeLeft)}</span>
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      {displayStatus === "pending" && (
                        <button
                          onClick={() => {
                            playSynthSound("click");
                            handleCollectVoucher(reward.id);
                          }}
                          className="px-3.5 py-1.5 bg-red hover:bg-red-light text-white text-[9px] font-black uppercase rounded-lg cursor-pointer transition-all shadow-sm active:scale-95"
                        >
                          Activate
                        </button>
                      )}

                      {displayStatus === "claimed" && (
                        <span className="status-pill bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {getFriendlyStatus(displayStatus)}
                        </span>
                      )}

                      {displayStatus === "expired" && (
                        <span className="status-pill bg-gray-100 text-gray-400 border border-gray-200">
                          {getFriendlyStatus(displayStatus)}
                        </span>
                      )}

                      {displayStatus === "rejected" && (
                        <span className="status-pill bg-red/5 text-red border border-red/10">
                          {getFriendlyStatus(displayStatus)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* HOW IT WORKS PROCESS */}
      <section className="py-16 px-4 max-w-4xl mx-auto w-full z-20 relative border-t border-gray-200">
        <div className="text-center mb-10">
          <span className="section-label">Process</span>
          <h2 className="text-3xl font-black font-serif text-navy mt-2">How It Works</h2>
          <p className="text-[11px] text-gray-600 mt-2 max-w-md mx-auto leading-relaxed font-semibold">
            Collecting rewards is effortless. Follow these simple steps during your visit to Café Coffee Break.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Sit & Enjoy", desc: "Enjoy your fresh, premium meal at Cafe Coffee Break." },
            { step: "02", title: "Tap Ask For Bill", desc: "Request bill check right from your phone seating position." },
            { step: "03", title: "Receive Code", desc: "Get your secret printed code on your checkout bill receipt." },
            { step: "04", title: "Redeem On Site", desc: "Visit ccbrewards.in and input code to bank your points." },
            { step: "05", title: "Earn Coins", desc: "Instantly unlock your loyalty coins on the go." },
            { step: "06", title: "Unlock Rewards", desc: "Exchange coins for premium coffee and delicious desserts!" }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="ccb-card p-5 flex flex-col items-start bg-white border-gray-200"
            >
              <span className="text-xl font-black text-red leading-none mb-3 font-serif">{item.step}</span>
              <h3 className="text-xs font-extrabold text-navy mb-1.5 uppercase tracking-wide">{item.title}</h3>
              <p className="text-[10px] text-gray-600 leading-relaxed font-semibold">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CUSTOMER STORIES (REVIEWS GRID) */}
      <section className="py-16 px-4 max-w-4xl mx-auto w-full z-20 relative border-t border-gray-200">
        <div className="text-center mb-10">
          <span className="section-label">Moments</span>
          <h2 className="text-3xl font-black font-serif text-navy mt-2">Customer Stories</h2>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {CUSTOMER_SCENES.map((scene, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="break-inside-avoid ccb-card overflow-hidden relative flex flex-col group border-gray-200 bg-white"
            >
              <div className="relative overflow-hidden aspect-[4/5] bg-gray-bg">
                <img 
                  src={scene.url} 
                  alt={scene.name} 
                  loading="lazy"
                  className="w-full h-full object-cover block group-hover:scale-102 transition-transform duration-500"
                />
                
                {/* Hover overlay review details */}
                <div className="absolute inset-0 bg-navy-deep/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                  <div className="flex gap-0.5 text-amber-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current stroke-none" />
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold text-white/90 leading-relaxed italic mb-3">
                    "{scene.review}"
                  </p>
                  <div className="border-t border-white/10 pt-2">
                    <span className="block text-[10px] font-bold text-white uppercase tracking-wider">{scene.name}</span>
                    <span className="block text-[8px] text-red uppercase tracking-widest mt-0.5 font-bold">{scene.reward}</span>
                  </div>
                </div>
              </div>

              {/* Static overlay bottom card */}
              <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
                <div>
                  <span className="block text-[10.5px] font-bold text-navy uppercase tracking-wider">{scene.name}</span>
                  <span className="block text-[7.5px] text-red uppercase tracking-widest mt-0.5 font-extrabold">{scene.reward}</span>
                </div>
                <div className="flex gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-current stroke-none" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* GOOGLE REVIEWS PREMIUM CTA BANNER */}
      <section className="py-8 px-4 max-w-4xl mx-auto w-full z-20 text-center border-t border-gray-200">
        <div className="bg-gradient-to-r from-[#0D1A38] via-[#1E2E56] to-[#0D1A38] p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-left relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-red/10 blur-2xl rounded-full group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
          <div>
            <h4 className="text-base font-extrabold text-white uppercase tracking-wider">Love your experience at Café Coffee Break?</h4>
            <p className="text-[10px] text-white/60 mt-1 font-semibold">Share your coffee moments and rate us on Google. It helps our staff keep brewing the best cup!</p>
          </div>
          <a
            href="https://g.page/r/cafecoffeebreak/review"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSynthSound("success")}
            className="flex-shrink-0 px-6 py-3.5 bg-red hover:bg-red-light text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 hover:shadow-red/20 hover:shadow-lg border border-red-light/35 cursor-pointer"
          >
            <span className="text-yellow-400">★ ★ ★ ★ ★</span>
            <span>Leave us a Google Review</span>
          </a>
        </div>
      </section>

      {/* TOAST PANEL */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 inset-x-4 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-navy border border-white/15 text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 pointer-events-auto">
              <Check className="w-4 h-4 text-red stroke-[3]" />
              <span className="text-[10px] font-black uppercase tracking-wider">{toastMessage.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABLE SELECT TRIGGER MODAL */}
      <AnimatePresence>
        {activeModal === "table-select" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm ccb-card p-6 flex flex-col h-[380px] bg-white border-gray-200 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black text-navy uppercase tracking-widest">Select Table Seating</h4>
                <button 
                  onClick={() => { playSynthSound("click"); setActiveModal(null); }}
                  className="p-1 rounded-full text-navy/40 hover:text-navy hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 hide-scrollbar">
                {availableTables.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => {
                      playSynthSound("success");
                      setTableId(t.id);
                      setActiveModal(null);
                      showToast(`Checked into ${t.name}`, "success");
                    }}
                    className={`w-full p-3.5 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between focus:outline-none cursor-pointer ${
                      t.id === tableId 
                        ? "bg-red/5 border-red text-red" 
                        : "bg-gray-bg border-transparent hover:border-navy/20 text-navy/80 hover:text-navy"
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="text-[8px] bg-white/10 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 font-mono font-bold">ID: {t.id}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SPIN POPUP MODAL (ANTI-FRAUD VERIFIED VOUCHER & COINS CELEBRATION) */}
      <AnimatePresence>
        {showSpinPopup && activeSpinReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-deep/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              className="w-full max-w-sm ccb-card p-6 flex flex-col items-center bg-white text-center shadow-2xl relative overflow-hidden rounded-[28px] border-red/20"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-navy via-red to-navy"></div>
              
              <div className="w-16 h-16 rounded-full bg-red/5 border border-red/10 flex items-center justify-center text-4xl shadow-inner mb-4 mt-2">
                {activeSpinReward.icon}
              </div>

              {/* COINS POPUP CELEBRATION DESIGN */}
              {activeSpinReward.rewardType === "luck" ? (
                <>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">🍀 Better Luck Next Time</span>
                  <h3 className="text-2xl font-black font-serif text-navy mb-3 leading-tight">
                    Better luck next time!
                  </h3>
                  
                  <p className="text-[10.5px] text-gray-600 max-w-xs leading-relaxed mb-5 font-semibold">
                    No reward won this time. Don't worry, you can spin the Lucky Brew wheel again after the 2-hour cooldown expires! Keep dining to earn more chances.
                  </p>

                  <div className="w-full">
                    <button 
                      onClick={() => {
                        setShowSpinPopup(false);
                        setActiveSpinReward(null);
                      }}
                      className="w-full py-3.5 btn-red text-xs uppercase tracking-wider font-extrabold cursor-pointer rounded-xl"
                    >
                      Try Again
                    </button>
                  </div>
                </>
              ) : activeSpinReward.rewardType === "coins" || activeSpinReward.rewardType === "bonus" ? (
                <>
                  <span className="text-[10px] font-black text-red uppercase tracking-widest mb-1.5">🎉 Congratulations!</span>
                  <h3 className="text-2xl font-black font-serif text-navy mb-3 leading-tight">
                    You won {activeSpinReward.rewardValue} CCB Coins!
                  </h3>
                  
                  <p className="text-[10.5px] text-gray-600 max-w-xs leading-relaxed mb-5 font-semibold">
                    Call one of our staff members to instantly receive your reward code.<br />
                    Your coins can be redeemed on: <a href="https://ccbrewards.in" target="_blank" rel="noopener noreferrer" className="text-red font-bold underline">CCBRewards.in</a><br />
                    Collect more coins and unlock free food, drinks, and exclusive rewards.
                  </p>

                  <div className="w-full space-y-2">
                    <button 
                      onClick={handleCallStaffForReward}
                      disabled={isSubmitting || notifiedStaffForReward}
                      className={`w-full py-3.5 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all shadow-md active:scale-95 ${
                        notifiedStaffForReward 
                          ? "bg-emerald-500 text-white cursor-default" 
                          : "btn-red cursor-pointer"
                      }`}
                    >
                      {notifiedStaffForReward ? "Staff Notified! Please wait..." : "Call Staff"}
                    </button>
                    
                    <button 
                      onClick={handleBankCoins}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-navy font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                    >
                      Bank in Wallet
                    </button>
                  </div>
                </>
              ) : (
                /* DISCOUNT / VOUCHER REWARD DESIGN */
                <>
                  <span className="text-[9px] font-black text-red uppercase tracking-widest mb-1">Voucher Earned!</span>
                  <h3 className="text-xl font-black font-serif text-navy mb-2 leading-tight">
                    {activeSpinReward.reward}
                  </h3>
                  
                  <p className="text-[10px] text-gray-600 max-w-xs leading-relaxed mb-4 font-semibold">
                    Dine-in discount voucher drawn! Claim it to activate the discount code, then show this screen to staff during checkout.
                  </p>

                  {/* TICKET COUPON WITH ANTI-FRAUD HASH DETAILS */}
                  <div className="w-full bg-gray-bg border border-gray-200 rounded-xl p-3.5 mb-4 relative text-left shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[7.5px] font-black text-gray-500 uppercase tracking-wider">Voucher Code</span>
                      <span className="text-[6.5px] bg-red/10 text-red border border-red/20 px-1.5 py-0.5 rounded font-mono font-bold">Verified</span>
                    </div>
                    
                    <span className="block text-base font-black text-navy font-mono tracking-widest text-center py-1 bg-white border border-gray-100 rounded-lg">
                      CCB-SPIN-{activeSpinReward.id.split("-")[2] || "9021"}
                    </span>

                    <div className="border-t border-gray-200 mt-3 pt-2 flex flex-col gap-1 text-[7.5px] font-semibold text-gray-500 font-mono">
                      <div className="flex justify-between">
                        <span>REWARD ID:</span>
                        <span className="text-navy truncate max-w-[150px]">{activeSpinReward.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SECURITY HASH:</span>
                        <span className="text-navy truncate max-w-[150px]">{activeSpinReward.token}</span>
                      </div>
                    </div>
                    
                    {/* Ticket punches left/right */}
                    <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-r border-gray-200"></div>
                    <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-l border-gray-200"></div>
                  </div>

                  <div className="w-full space-y-2">
                    <button 
                      onClick={() => handleCollectVoucher()}
                      className="w-full py-3.5 btn-red text-xs uppercase tracking-wider font-extrabold cursor-pointer rounded-xl"
                    >
                      Claim & Activate
                    </button>
                    <button 
                      onClick={() => {
                        if (activeSpinReward) {
                          sessionStorage.setItem(`ccb_dismissed_reward_${activeSpinReward.id}`, "true");
                        }
                        setShowSpinPopup(false);
                        setActiveSpinReward(null);
                      }}
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-navy/60 font-bold text-[10px] uppercase rounded-xl cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="bg-navy-deep text-white pt-16 pb-8 px-6 mt-auto relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            
            {/* Brand Logo & Info */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo/ccb new (1).png" 
                  alt="Café Coffee Break" 
                  className="h-12 w-auto object-contain rounded-lg border border-white/10"
                />
                <div className="flex flex-col">
                  <span className="font-serif text-lg font-black text-white leading-none">Café Coffee Break</span>
                  <span className="text-[8px] text-red tracking-widest font-black uppercase mt-1">Rewards Companion</span>
                </div>
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed font-semibold">
                Enjoy premium coffee moments in Jodhpur. Place requests, explore stories, and get verified rewards live at your table.
              </p>

              {/* Instagram & Social handles */}
              <div className="flex items-center gap-3 mt-1.5">
                <a 
                  href="https://instagram.com/cafecoffeebreak" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-red hover:bg-red text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                >
                  <span>Instagram</span>
                </a>
                <a 
                  href="https://g.page/r/cafecoffeebreak/review" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-red hover:bg-red text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                >
                  <span>Google Reviews</span>
                </a>
              </div>
            </div>

            {/* Address & Hours */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono">Location & Hours</span>
              <div className="flex flex-col gap-3 text-[10px] text-white/70 font-semibold">
                <div>
                  <span className="block text-white/40 text-[8px] uppercase tracking-wider mb-0.5">Address</span>
                  <span>20 West Patel Nagar, Circuit House Road, Jodhpur, Rajasthan</span>
                </div>
                <div>
                  <span className="block text-white/40 text-[8px] uppercase tracking-wider mb-0.5">Phone</span>
                  <span>+91 9799552525</span>
                </div>
                <div>
                  <span className="block text-white/40 text-[8px] uppercase tracking-wider mb-0.5">Opening Hours</span>
                  <span>Open Daily: 11:00 AM - 11:00 PM</span>
                </div>
              </div>
            </div>

            {/* Loyalty Quick Navigation links */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono">CCB Loyalty Links</span>
              <div className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-wider text-white/70">
                <a href="https://ccbrewards.in" target="_blank" rel="noopener noreferrer" className="hover:text-red transition-colors flex items-center gap-1">
                  <span>Rewards Home</span>
                  <ChevronRight className="w-3 h-3 text-red" />
                </a>
                <a href="https://ccbrewards.in/redeem" target="_blank" rel="noopener noreferrer" className="hover:text-red transition-colors flex items-center gap-1">
                  <span>Redeem Voucher</span>
                  <ChevronRight className="w-3 h-3 text-red" />
                </a>
                <a href="https://ccbrewards.in/marketplace" target="_blank" rel="noopener noreferrer" className="hover:text-red transition-colors flex items-center gap-1">
                  <span>Loyalty Market</span>
                  <ChevronRight className="w-3 h-3 text-red" />
                </a>
              </div>
            </div>

          </div>

          {/* Sub Footer Attribution */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9.5px] text-white/40 font-semibold">
            <span>© 2026 Café Coffee Break (CCB). Jodhpur. All rights reserved.</span>
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-red">
              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse"></span>
              <span>Dine-In System Companion</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
