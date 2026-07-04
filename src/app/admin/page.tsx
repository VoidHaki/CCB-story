"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Coffee, 
  Trash2, 
  Edit, 
  Plus, 
  QrCode, 
  Volume2, 
  VolumeX, 
  Check, 
  X, 
  RefreshCw, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  Upload,
  FolderOpen,
  Lock,
  LogOut,
  Gift,
  Award,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Table {
  id: string;
  name: string;
}

interface CafeRequest {
  id: string;
  tableId: string;
  tableName: string;
  type: "Waiter Call" | "Ask For Bill";
  time: string;
  status: "pending" | "resolved";
  resolvedTime?: string;
}

interface SpinReward {
  id: string;
  tableId: string;
  tableName: string;
  reward: string;
  rewardType: "coins" | "discount" | "food" | "mystery" | "bonus";
  rewardValue: string | number;
  icon: string;
  token: string;
  timestamp: string;
  expiresAt: string;
  status: "pending" | "claimed" | "rejected" | "expired";
  claimedAt?: string;
  rejectedAt?: string;
}

export default function AdminDashboard() {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");

  // States
  const [tables, setTables] = useState<Table[]>([]);
  const [activeRequests, setActiveRequests] = useState<CafeRequest[]>([]);
  const [history, setHistory] = useState<CafeRequest[]>([]);
  const [spinRewards, setSpinRewards] = useState<SpinReward[]>([]);
  const [mediaAssets, setMediaAssets] = useState<{logo: string[]; gallery: string[]; reels: string[]; media: string[]}>({
    logo: [],
    gallery: [],
    reels: [],
    media: []
  });
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"calls" | "rewards" | "tables" | "media">("calls");

  // Media Manager upload state
  const [uploadType, setUploadType] = useState<"media" | "gallery" | "reels" | "logo">("reels");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Audio Alerts
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Forms & Modals
  const [newTableId, setNewTableId] = useState("");
  const [newTableName, setNewTableName] = useState("");
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editTableName, setEditTableName] = useState("");
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const knownRequestIds = useRef<Set<string>>(new Set());
  const knownRewardIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  // Check login state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("ccb_admin_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Unlock AudioContext for staff dashboard audio alerts under autoplay restrictions
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "2525") {
      setIsAuthenticated(true);
      setLoginError("");
      if (typeof window !== "undefined") {
        localStorage.setItem("ccb_admin_auth", "true");
      }
    } else {
      setLoginError("Invalid staff access passcode");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ccb_admin_auth");
    }
  };

  // Sound Synth alert generator
  const playAlertSound = (type: "waiter" | "bill" | "reward" | "success" | "delete") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (type === "waiter") {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";

        osc1.frequency.setValueAtTime(659.25, now);
        osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.15);
        
        osc2.frequency.setValueAtTime(880.00, now);
        osc2.frequency.exponentialRampToValueAtTime(1100.00, now + 0.15);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        gainNode.gain.setValueAtTime(0.45, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
      } else if (type === "bill") {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "triangle";

        osc1.frequency.setValueAtTime(523.25, now);
        osc1.frequency.setValueAtTime(659.25, now + 0.1);
        osc1.frequency.setValueAtTime(783.99, now + 0.2);
        osc1.frequency.setValueAtTime(1046.50, now + 0.3);

        osc2.frequency.setValueAtTime(261.63, now);
        osc2.frequency.setValueAtTime(329.63, now + 0.15);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        gainNode.gain.setValueAtTime(0.45, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.9);
        osc2.stop(now + 0.9);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "reward") {
          const now = ctx.currentTime;
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.06);
          osc.frequency.setValueAtTime(783.99, now + 0.12);
          osc.frequency.setValueAtTime(1046.50, now + 0.18);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.start();
          osc.stop(now + 0.8);
        } else if (type === "success") {
          osc.frequency.setValueAtTime(523, ctx.currentTime);
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } else if (type === "delete") {
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Live Sync Fetch
  const fetchData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    setErrorMessage("");
    try {
      const tablesRes = await fetch("/api/tables");
      if (tablesRes.ok) {
        setTables(await tablesRes.json());
      }

      const requestsRes = await fetch("/api/requests");
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        const activeList = requestsData.requests;
        setActiveRequests(activeList);
        setHistory(requestsData.history);
        
        if (!isFirstLoad.current) {
          const newRequests = activeList.filter((r: any) => !knownRequestIds.current.has(r.id));
          if (newRequests.length > 0) {
            newRequests.forEach((req: any) => {
              if (req.type === "Ask For Bill") {
                playAlertSound("bill");
              } else {
                playAlertSound("waiter");
              }
            });
          }
        }
        knownRequestIds.current = new Set(activeList.map((r: any) => r.id));
      }

      // Fetch spin rewards
      const spinRes = await fetch("/api/spin");
      if (spinRes.ok) {
        const spinsData = await spinRes.json();
        setSpinRewards(spinsData);
        
        const pendingSpins = spinsData.filter((r: any) => r.status === "pending");
        if (!isFirstLoad.current) {
          const newPendingSpins = pendingSpins.filter((r: any) => !knownRewardIds.current.has(r.id));
          if (newPendingSpins.length > 0) {
            playAlertSound("reward");
          }
        }
        knownRewardIds.current = new Set(pendingSpins.map((r: any) => r.id));
      }

      const mediaRes = await fetch("/api/media");
      if (mediaRes.ok) {
        setMediaAssets(await mediaRes.json());
      }

      isFirstLoad.current = false;
    } catch (e) {
      console.error(e);
      setErrorMessage("Could not sync with local database");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const interval = setInterval(() => {
        fetchData(true);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Resolve Customer Call
  const handleResolveRequest = async (id: string) => {
    try {
      const res = await fetch("/api/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        playAlertSound("success");
        fetchData(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Clear completed list
  const handleClearHistory = async () => {
    if (!confirm("Clear all resolved history logs?")) return;
    try {
      const res = await fetch("/api/requests?mode=history", {
        method: "DELETE"
      });
      if (res.ok) {
        playAlertSound("delete");
        fetchData(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Approve / Reject Rewards
  const handleUpdateRewardStatus = async (id: string, action: "claim" | "reject") => {
    try {
      const res = await fetch("/api/spin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      });
      if (res.ok) {
        playAlertSound(action === "claim" ? "success" : "delete");
        fetchData(true);
      } else {
        const err = await res.json();
        alert(err.error || "Action failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Table Seating Position
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableId || !newTableName) return;
    setErrorMessage("");
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: newTableId, name: newTableName })
      });
      if (res.ok) {
        playAlertSound("success");
        setNewTableId("");
        setNewTableName("");
        setShowAddForm(false);
        fetchData(true);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to add table");
      }
    } catch (e) {
      setErrorMessage("Connection error");
    }
  };

  // Rename Table Seating
  const handleRenameTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !editTableName) return;
    setErrorMessage("");
    try {
      const res = await fetch("/api/tables", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingTable.id, name: editTableName })
      });
      if (res.ok) {
        playAlertSound("success");
        setEditingTable(null);
        setEditTableName("");
        fetchData(true);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to rename table");
      }
    } catch (e) {
      setErrorMessage("Connection error");
    }
  };

  // Delete Seating Position
  const handleDeleteTable = async (id: string) => {
    if (!confirm(`Delete Table ID ${id}?`)) return;
    setErrorMessage("");
    try {
      const res = await fetch("/api/tables", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        playAlertSound("delete");
        fetchData(true);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to delete table");
      }
    } catch (e) {
      setErrorMessage("Connection error");
    }
  };

  // Media Manager CMS
  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage("");
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", uploadType);

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        playAlertSound("success");
        setSelectedFile(null);
        const fileInput = document.getElementById("file-uploader-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchData(true);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Upload failed");
      }
    } catch (e) {
      setErrorMessage("Connection upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaDelete = async (type: string, filename: string) => {
    if (!confirm(`Delete file (${filename})?`)) return;
    setErrorMessage("");
    try {
      const res = await fetch("/api/media/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, filename })
      });
      if (res.ok) {
        playAlertSound("delete");
        fetchData(true);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Delete failed");
      }
    } catch (e) {
      setErrorMessage("Connection delete error");
    }
  };

  const getTableLink = (id: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/table/${id}`;
    }
    return `/table/${id}`;
  };

  // RENDER PORTAL ACCESS LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6 bg-grid">
        <div className="w-full max-w-sm glass-panel p-8 flex flex-col items-center border-white/10 bg-navy-deep/80 shadow-2xl rounded-3xl">
          
          <div className="w-14 h-14 rounded-2xl bg-red/10 border border-red/30 flex items-center justify-center shadow-lg mb-6">
            <Lock className="w-6 h-6 text-red" />
          </div>

          <span className="text-[10px] font-black uppercase text-red tracking-widest mb-1.5">CCB Staff Portal</span>
          <h1 className="text-xl font-black text-white uppercase text-center mb-6 tracking-wider">Café Coffee Break</h1>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Passcode Key</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red/40 text-center font-bold"
                required
              />
            </div>

            {loginError && (
              <span className="block text-[9.5px] font-bold text-red text-center">{loginError}</span>
            )}

            <button 
              type="submit"
              className="w-full py-3.5 btn-red text-xs uppercase tracking-widest font-black cursor-pointer"
            >
              Authorize Terminal
            </button>
          </form>

          <span className="block text-[9px] text-white/30 mt-6 text-center font-bold uppercase tracking-wider">Jodhpur Dine-In Suite</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1A38] text-white flex flex-col font-sans relative pb-12 bg-grid">
      
      {/* HEADER SECTION */}
      <header className="glass-header py-4 px-6 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red/10 border border-red/20 flex items-center justify-center shadow-md">
              <Coffee className="w-5 h-5 text-red" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-white uppercase flex items-center gap-1.5 leading-none">
                <span>Café Staff Dashboard</span>
                <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Live</span>
              </h1>
              <span className="block text-[9.5px] text-white/40 leading-none mt-1.5 font-bold uppercase tracking-wider">Seating & Order Companion</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fetchData()}
              className={`p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:text-red hover:border-red/30 transition-all focus:outline-none cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh console"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:text-red hover:border-red/30 transition-all focus:outline-none cursor-pointer"
              title="Toggle audio alerts"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-red" /> : <VolumeX className="w-4 h-4 text-white/50" />}
            </button>

            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-red hover:bg-red/10 hover:border-red/30 transition-all focus:outline-none cursor-pointer"
              title="Lock Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="bg-red/10 border-b border-red/20 px-6 py-3 text-xs text-red font-bold flex items-center gap-2 max-w-7xl mx-auto w-full mt-4 rounded-xl">
          <ShieldAlert className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* CORE PORTAL TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-3">
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: "calls", label: "Waiter Calls", count: activeRequests.length },
              { id: "rewards", label: "Wheel Rewards", count: spinRewards.filter(r => r.status === "pending").length },
              { id: "tables", label: "Tables & QRs", count: tables.length },
              { id: "media", label: "Media CMS", count: 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
                  activeTab === tab.id
                    ? "bg-red text-white border-red shadow-md"
                    : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-mono ${
                    activeTab === tab.id ? "bg-white text-red" : "bg-red text-white"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <a
            href="/tablet-wheel"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2 border bg-gradient-to-tr from-gold to-gold-light text-[#0D1A38] border-gold hover:brightness-110 shadow-md active:scale-95 font-bold"
          >
            <span>🎡 Open Tablet Lucky Wheel</span>
          </a>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto w-full px-6 mt-6 flex-1">

        {/* 1. WAITER CALLS TAB */}
        {activeTab === "calls" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Queue: Pending Calls */}
            <div className="lg:col-span-7 glass-panel p-6 min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Active Waiter Calls</h3>
                  <span className="text-[9px] text-white/40 font-bold uppercase">Customer seating response line</span>
                </div>
                <span className="status-pill bg-red/10 text-red border border-red/20">{activeRequests.length} Pending</span>
              </div>

              <div className="flex-1 space-y-3.5 overflow-y-auto no-scrollbar max-h-[500px]">
                {activeRequests.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
                    <span className="text-xs font-bold uppercase tracking-wider">Queue is clear</span>
                    <span className="text-[9px] mt-1">Dine-in calls will automatically sound and list here</span>
                  </div>
                ) : (
                  activeRequests.map(req => (
                    <div 
                      key={req.id} 
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner">
                          {req.type === "Ask For Bill" ? "🧾" : "🔔"}
                        </div>
                        <div>
                          <span className="block text-sm font-extrabold text-white">{req.tableName}</span>
                          <span className="block text-[8px] text-red uppercase tracking-widest font-black mt-0.5">
                            {req.type === "Ask For Bill" ? "Checking out / Bill check" : "Waiter assistance needed"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-white/40 font-mono font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{req.time}</span>
                        </span>
                        <button
                          onClick={() => handleResolveRequest(req.id)}
                          className="px-4 py-2 bg-red hover:bg-red-light text-white font-black text-[9px] uppercase rounded-lg cursor-pointer shadow transition-all active:scale-95"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel: Resolution History */}
            <div className="lg:col-span-5 glass-panel p-6 flex flex-col h-[582px]">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Completed History</h3>
                  <span className="text-[9px] text-white/40 font-bold uppercase">Archived service requests</span>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={handleClearHistory}
                    className="text-[9px] font-black text-red hover:underline uppercase tracking-wider flex items-center gap-1 focus:outline-none cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto no-scrollbar max-h-[460px]">
                {history.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center py-20 opacity-20">
                    <span className="text-[9px] font-black uppercase tracking-wider">No completed records</span>
                  </div>
                ) : (
                  history.map(h => (
                    <div 
                      key={h.id} 
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[9.5px] font-bold flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span>{h.type === "Ask For Bill" ? "🧾" : "🔔"}</span>
                        <span className="text-white">{h.tableName}</span>
                        <span className="text-white/30">resolved</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white/40 font-mono text-[8px]">
                        <span>{h.time} → {h.resolvedTime}</span>
                        <span className="text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/15 uppercase font-bold text-[7px]">OK</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* 2. SECURE WHEEL REWARDS TAB */}
        {activeTab === "rewards" && (
          <div className="glass-panel p-6 min-h-[500px]">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Spin & Win Redemptions</h3>
                <span className="text-[9px] text-white/40 font-bold uppercase">Backend-verified client rewards log</span>
              </div>
              <span className="status-pill bg-red/10 text-red border border-red/20">
                {spinRewards.length} total generated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-white/45">
                    <th className="pb-3.5 pl-2">Time</th>
                    <th className="pb-3.5">Table</th>
                    <th className="pb-3.5">Reward</th>
                    <th className="pb-3.5">Verification Hash</th>
                    <th className="pb-3.5">Status</th>
                    <th className="pb-3.5 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[10.5px]">
                  {spinRewards.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-white/30">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Gift className="w-8 h-8 text-red/40" />
                          <span className="text-xs font-bold uppercase tracking-wider">No rewards generated yet</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    spinRewards.map(reward => {
                      const isExpired = new Date(reward.expiresAt).getTime() < Date.now() && reward.status === "pending";
                      const currentStatus = isExpired ? "expired" : reward.status;

                      return (
                        <tr key={reward.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 pl-2 font-mono text-white/50 text-[9px]">
                            {new Date(reward.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-4 font-bold text-white">{reward.tableName}</td>
                          <td className="py-4">
                            <span className="inline-flex items-center gap-1.5">
                              <span>{reward.icon}</span>
                              <span className="font-extrabold text-white uppercase tracking-wider">{reward.reward}</span>
                            </span>
                          </td>
                          <td className="py-4 font-mono text-white/40 text-[8px]" title={reward.token}>
                            {reward.token.substring(0, 16)}...
                          </td>
                          <td className="py-4">
                            <span className={`status-pill ${
                              currentStatus === "claimed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              currentStatus === "rejected" ? "bg-red/10 text-red border border-red/20" :
                              currentStatus === "expired" ? "bg-white/5 text-white/35 border border-white/10" :
                              "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {currentStatus === "claimed" ? "Redeemed" :
                               currentStatus === "pending" ? "Pending" :
                               currentStatus === "rejected" ? "Rejected" :
                               currentStatus === "expired" ? "Expired" : currentStatus}
                            </span>
                          </td>
                          <td className="py-4 text-right pr-2">
                            {currentStatus === "pending" && (
                              <div className="inline-flex gap-1.5">
                                <button
                                  onClick={() => handleUpdateRewardStatus(reward.id, "claim")}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[8px] font-black uppercase rounded cursor-pointer"
                                  title="Approve and mark Claimed"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateRewardStatus(reward.id, "reject")}
                                  className="px-2.5 py-1 bg-red hover:bg-red-light text-white text-[8px] font-black uppercase rounded cursor-pointer"
                                  title="Reject claim"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {currentStatus === "claimed" && (
                              <span className="text-[8.5px] font-mono text-white/30">Redeemed at {reward.claimedAt ? new Date(reward.claimedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</span>
                            )}
                            {currentStatus === "rejected" && (
                              <span className="text-[8.5px] font-mono text-white/30">Rejected</span>
                            )}
                            {currentStatus === "expired" && (
                              <span className="text-[8.5px] font-mono text-white/30">Expired</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TABLES SEATING & QR CODE GENERATION TAB */}
        {activeTab === "tables" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Tables mapping CRUD */}
            <div className="lg:col-span-7 glass-panel p-6 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Dine-In Seating Setup</h3>
                  <span className="text-[9px] text-white/40 font-bold uppercase">Configure tables & download scan QRs</span>
                </div>
                <button
                  onClick={() => { playAlertSound("success"); setShowAddForm(!showAddForm); setEditingTable(null); }}
                  className="px-3.5 py-1.5 rounded-lg bg-red hover:bg-red-light text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{showAddForm ? "Cancel" : "Add Table"}</span>
                </button>
              </div>

              {/* Add Table form */}
              {showAddForm && (
                <form onSubmit={handleAddTable} className="p-5 bg-white/5 border border-white/5 rounded-2xl mb-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">New Seating Position</h4>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Table Seating ID (Int)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 18"
                        value={newTableId}
                        onChange={(e) => setNewTableId(e.target.value)}
                        className="w-full bg-[#0D1A38] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red/40"
                        required
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Display Label</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Table 18"
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value)}
                        className="w-full bg-[#0D1A38] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red/40"
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 btn-red text-xs uppercase tracking-widest font-black cursor-pointer"
                  >
                    Confirm & Save Seating
                  </button>
                </form>
              )}

              {/* Rename Table form */}
              {editingTable && (
                <form onSubmit={handleRenameTable} className="p-5 bg-white/5 border border-white/5 rounded-2xl mb-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Rename {editingTable.name}</h4>
                    <button type="button" onClick={() => setEditingTable(null)} className="text-white/40 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-white/40 uppercase mb-1">New Label name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. VIP Seating 12"
                      value={editTableName}
                      onChange={(e) => setEditTableName(e.target.value)}
                      className="w-full bg-[#0D1A38] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 btn-red text-xs uppercase tracking-widest font-black cursor-pointer"
                  >
                    Apply New Label
                  </button>
                </form>
              )}

              {/* Active Tables Map List */}
              <div className="space-y-3 overflow-y-auto no-scrollbar max-h-[460px]">
                {tables.map(t => (
                  <div 
                    key={t.id} 
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <span className="block text-sm font-extrabold text-white">{t.name}</span>
                      <span className="block text-[8px] text-white/40 font-mono mt-1 font-bold">TABLE ROUTE: /table/{t.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { playAlertSound("success"); setQrModalTable(t); }}
                        className="p-2 bg-white/5 border border-white/10 hover:border-red/40 rounded-lg text-white hover:text-red transition-all cursor-pointer focus:outline-none"
                        title="Display Stand QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          playAlertSound("success");
                          setEditingTable(t);
                          setEditTableName(t.name);
                          setShowAddForm(false);
                        }}
                        className="p-2 bg-white/5 border border-white/10 hover:border-red/40 rounded-lg text-white hover:text-red transition-all cursor-pointer focus:outline-none"
                        title="Rename Table"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(t.id)}
                        className="p-2 bg-white/5 border border-white/10 hover:border-red/40 rounded-lg text-red hover:bg-red/10 transition-all cursor-pointer focus:outline-none"
                        title="Remove Table"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Scanner Display Help stand */}
            <div className="lg:col-span-5 glass-panel p-6 flex flex-col items-center justify-center text-center min-h-[500px]">
              <QrCode className="w-16 h-16 text-red mb-4 opacity-40 anim-float" />
              <h3 className="text-base font-black uppercase tracking-wider text-white">QR Table Generation</h3>
              <p className="text-[10px] text-white/50 leading-relaxed font-semibold max-w-xs mt-2">
                Click the QR code icon next to any table to view, print, or copy the direct mapping URL. Scanning the stand automatically selects their seating position!
              </p>
            </div>

          </div>
        )}

        {/* 4. MEDIA CMS MANAGER TAB */}
        {activeTab === "media" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Upload Form */}
            <div className="lg:col-span-6 glass-panel p-6 flex flex-col">
              <div className="mb-5 pb-3 border-b border-white/5">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Upload Brand Assets</h3>
                <span className="text-[9px] text-white/40 font-bold uppercase">Dynamic image & video files manager</span>
              </div>

              <form onSubmit={handleMediaUpload} className="space-y-4">
                <div>
                  <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Target Directory</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full bg-[#0D1A38] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none font-bold"
                  >
                    <option value="reels">Dine-In Reels (reels/)</option>
                    <option value="gallery">Gallery (gallery/)</option>
                    <option value="logo">Brand Logos (logo/)</option>
                    <option value="media">Hero Banner (media/)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Choose Asset File</label>
                  <input 
                    id="file-uploader-input"
                    type="file" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#0D1A38] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="w-full py-3 btn-red text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? "Uploading..." : "Upload Asset File"}</span>
                </button>
              </form>
            </div>

            {/* Right Asset Explorer */}
            <div className="lg:col-span-6 glass-panel p-6 flex flex-col h-[520px] overflow-hidden">
              <div className="mb-5 pb-3 border-b border-white/5">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Workspace Assets</h3>
                <span className="text-[9px] text-white/40 font-bold uppercase">Dynamic public files listing</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 no-scrollbar pr-1">
                {[
                  { label: "Instagram Reels (reels/)", type: "reels", items: mediaAssets.reels },
                  { label: "Coffee Gallery (gallery/)", type: "gallery", items: mediaAssets.gallery },
                  { label: "Brand Logos (logo/)", type: "logo", items: mediaAssets.logo },
                  { label: "Hero Banner Media (media/)", type: "media", items: mediaAssets.media }
                ].map((folder, folderIdx) => (
                  <div key={folderIdx} className="space-y-2">
                    <span className="text-[8.5px] font-black text-red uppercase tracking-widest flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{folder.label}</span>
                    </span>

                    {folder.items.length === 0 ? (
                      <span className="block text-[9px] text-white/35 italic pl-5">Empty (using system standard fallbacks)</span>
                    ) : (
                      <div className="space-y-1.5 pl-5">
                        {folder.items.map((file, idx) => (
                          <div 
                            key={idx} 
                            className="p-2 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between text-[10px] font-bold"
                          >
                            <span className="text-white/60 truncate max-w-[240px]" title={file}>{file}</span>
                            <button
                              type="button"
                              onClick={() => handleMediaDelete(folder.type, file)}
                              className="text-red hover:text-red-light p-1 focus:outline-none cursor-pointer"
                              title="Delete file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* QR PRINT MODAL VIEW */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel p-6 relative flex flex-col items-center text-center border-white/10 bg-[#0A0A0E] shadow-2xl rounded-3xl">
            
            <button 
              onClick={() => { playAlertSound("delete"); setQrModalTable(null); }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <span className="text-[9px] font-black text-red uppercase tracking-widest mb-1">Café Coffee Break</span>
            <h3 className="text-base font-bold text-white mb-4">Print Seating QR: {qrModalTable.name}</h3>

            <div className="bg-white p-4.5 rounded-2xl w-48 h-48 flex items-center justify-center mb-4 border border-white/10 shadow-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getTableLink(qrModalTable.id))}`}
                alt={`Table ${qrModalTable.id} QR`}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[9px] font-mono text-white/55 mb-6 break-all select-all flex items-center gap-1.5">
              <span>{getTableLink(qrModalTable.id)}</span>
              <a 
                href={getTableLink(qrModalTable.id)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red hover:text-red-light"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const printW = window.open("", "_blank");
                    if (printW) {
                      printW.document.write(`
                        <html>
                          <head>
                            <title>Print Stand - ${qrModalTable.name}</title>
                            <style>
                              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 40px; background-color: #0d1a38; color: #ffffff; }
                              .card { border: 2.5px solid #d91f3a; border-radius: 28px; padding: 40px; display: inline-block; max-width: 340px; background-color: #132247; box-shadow: 0 20px 45px rgba(0,0,0,0.5); }
                              .brand { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: #d91f3a; text-transform: uppercase; margin-bottom: 6px; }
                              .title { font-size: 28px; font-weight: 950; margin-bottom: 24px; text-transform: uppercase; color: #ffffff; font-family: Georgia, serif; }
                              .subtitle { font-size: 13px; font-weight: bold; color: #ffffff; margin-top: 24px; opacity: 0.85; }
                              img { max-width: 100%; height: auto; border-radius: 20px; padding: 12px; background-color: #ffffff; }
                            </style>
                          </head>
                          <body>
                            <div class="card">
                              <div class="brand">Café Coffee Break</div>
                              <div class="title">${qrModalTable.name}</div>
                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getTableLink(qrModalTable.id))}" />
                              <div class="subtitle">Scan table QR stand to request service instantly</div>
                            </div>
                            <script>window.onload = function() { window.print(); window.close(); }</script>
                          </body>
                        </html>
                      `);
                      printW.document.close();
                    }
                  }
                }}
                className="py-2.5 rounded-xl btn-red text-[10px] uppercase tracking-wider font-black cursor-pointer shadow-md"
              >
                Print Stand
              </button>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(getTableLink(qrModalTable.id));
                  alert("Table URL copied to clipboard!");
                }}
                className="py-2.5 rounded-xl glass-btn text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Copy URL
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
