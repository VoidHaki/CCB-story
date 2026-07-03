import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { readDb, writeDb, SpinReward, generateRewardToken } from "@/lib/db";

// Unified 12 rewards matching the frontend wheel sectors exactly (index 0 to 11)
const SPIN_REWARDS = [
  { reward: "+5 Coins",     type: "coins"    as const, value: 5,            icon: "🪙", weight: 28 },
  { reward: "10% Off",      type: "discount" as const, value: "10%",        icon: "🏷️", weight: 6  },
  { reward: "+10 Coins",    type: "coins"    as const, value: 10,           icon: "🪙", weight: 22 },
  { reward: "Free Coffee",  type: "food"     as const, value: "Free Coffee",icon: "☕", weight: 1  },
  { reward: "+15 Coins",    type: "coins"    as const, value: 15,           icon: "🪙", weight: 16 },
  { reward: "Mystery Gift", type: "mystery"  as const, value: "Mystery Gift",icon: "🎁", weight: 2  },
  { reward: "+20 Coins",    type: "coins"    as const, value: 20,           icon: "🪙", weight: 11 },
  { reward: "Free Brownie", type: "food"     as const, value: "Free Brownie",icon: "🍰", weight: 0.7},
  { reward: "+25 Coins",    type: "coins"    as const, value: 25,           icon: "🪙", weight: 7  },
  { reward: "15% Off",      type: "discount" as const, value: "15%",        icon: "🏷️", weight: 4  },
  { reward: "Lucky Bonus",  type: "bonus"    as const, value: 50,           icon: "✨", weight: 3  },
  { reward: "Free Pizza",   type: "food"     as const, value: "Free Pizza", icon: "🍕", weight: 0.3},
];

const COOLDOWN_DURATION = 2 * 60 * 60 * 1000; // 2 hours

function pickWeightedReward() {
  const total = SPIN_REWARDS.reduce((s, r) => s + r.weight, 0);
  let rand = Math.random() * total;
  for (const r of SPIN_REWARDS) {
    if (rand < r.weight) return r;
    rand -= r.weight;
  }
  return SPIN_REWARDS[0];
}

// POST /api/spin — initiate a spin (server determines reward)
export async function POST(req: Request) {
  try {
    const { tableId } = await req.json();
    if (!tableId) {
      return NextResponse.json({ error: "Missing tableId" }, { status: 400 });
    }

    // 1. Get or generate device ID cookie
    const cookieStore = await cookies();
    let deviceId = cookieStore.get("ccb_device_id")?.value;
    const isNewDevice = !deviceId;
    if (!deviceId) {
      deviceId = crypto.randomUUID();
    }

    // 2. Compute request fingerprint from IP and User Agent
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const ua = req.headers.get("user-agent") || "";
    const fingerprint = crypto.createHash("md5").update(`${ip}:${ua}`).digest("hex");

    const db = readDb();
    const now = Date.now();

    // Anti-fraud: find table
    const table = db.tables.find(t => t.id === String(tableId));
    if (!table) {
      return NextResponse.json({ error: "Invalid table" }, { status: 403 });
    }

    // Anti-fraud: enforce 2-hour cooldown for table, device, or fingerprint
    const recentSpin = db.spinRewards.find(reward => {
      const rewardTime = new Date(reward.timestamp).getTime();
      const isWithinCooldown = (now - rewardTime) < COOLDOWN_DURATION;
      
      const matchesTable = reward.tableId === String(tableId);
      const matchesDevice = reward.deviceId && reward.deviceId === deviceId;
      const matchesFingerprint = reward.fingerprint && reward.fingerprint === fingerprint;

      return isWithinCooldown && (matchesTable || matchesDevice || matchesFingerprint);
    });

    if (recentSpin) {
      return NextResponse.json({ 
        error: "You have already spun the Lucky Brew wheel. Please wait for the cooldown to expire." 
      }, { status: 429 });
    }

    // Anti-fraud: check if this table/device already has an unexpired pending reward
    const activePendingReward = db.spinRewards.find(reward => {
      if (reward.status !== "pending") return false;
      
      const matchesTable = reward.tableId === String(tableId);
      const matchesDevice = reward.deviceId && reward.deviceId === deviceId;
      const matchesFingerprint = reward.fingerprint && reward.fingerprint === fingerprint;
      
      if (!(matchesTable || matchesDevice || matchesFingerprint)) return false;

      const rewardTime = new Date(reward.timestamp).getTime();
      const expiryDuration = reward.rewardType === "discount" ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      return (now - rewardTime) < expiryDuration;
    });

    if (activePendingReward) {
      return NextResponse.json({ 
        error: "You already have an unclaimed pending reward! Please claim it first." 
      }, { status: 409 });
    }

    // Pick reward server-side
    const picked = pickWeightedReward();

    const id = `spin-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const timestamp = new Date().toISOString();
    
    // Discount rewards expire in 2 hours; other rewards in 24 hours
    const expiryDuration = picked.type === "discount" ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(now + expiryDuration).toISOString();

    const token = generateRewardToken(id, String(tableId), picked.reward);

    const spinReward: SpinReward = {
      id,
      tableId: String(tableId),
      tableName: table.name,
      reward: picked.reward,
      rewardType: picked.type,
      rewardValue: picked.value,
      icon: picked.icon,
      token,
      timestamp,
      expiresAt,
      status: "pending",
      deviceId,
      fingerprint
    };

    db.spinRewards.unshift(spinReward);
    writeDb(db);

    // Return reward info + the wheel segment index for animation (which now aligns perfectly)
    const rewardIndex = SPIN_REWARDS.findIndex(r => r.reward === picked.reward);

    const response = NextResponse.json({
      id,
      reward: picked.reward,
      rewardType: picked.type,
      rewardValue: picked.value,
      icon: picked.icon,
      token,
      rewardIndex,
      expiresAt
    });

    // Save device ID cookie
    if (isNewDevice) {
      response.cookies.set("ccb_device_id", deviceId, {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      });
    }

    return response;
  } catch (e) {
    console.error("Spin error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/spin — list all rewards (admin only - use admin panel)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId");

    const db = readDb();
    
    // If a specific tableId is requested, filter rewards for that table
    if (tableId) {
      const tableRewards = db.spinRewards.filter(r => r.tableId === String(tableId));
      return NextResponse.json(tableRewards);
    }

    return NextResponse.json(db.spinRewards);
  } catch (e) {
    console.error("Error in GET /api/spin:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT /api/spin — claim or reject a reward (can be done by customer for discount or admin for others)
export async function PUT(req: Request) {
  try {
    const { id, action } = await req.json(); // action: "claim" | "reject"
    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
    }

    const db = readDb();
    const rewardIndex = db.spinRewards.findIndex(r => r.id === id);
    if (rewardIndex === -1) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    const reward = db.spinRewards[rewardIndex];

    // Check not already claimed/rejected
    if (reward.status !== "pending") {
      return NextResponse.json({ error: `Reward already ${reward.status}` }, { status: 409 });
    }

    // Check not expired
    if (new Date(reward.expiresAt).getTime() < Date.now()) {
      db.spinRewards[rewardIndex].status = "expired";
      writeDb(db);
      return NextResponse.json({ error: "Reward expired" }, { status: 410 });
    }

    if (action === "claim") {
      db.spinRewards[rewardIndex].status = "claimed";
      db.spinRewards[rewardIndex].claimedAt = new Date().toISOString();
    } else if (action === "reject") {
      db.spinRewards[rewardIndex].status = "rejected";
      db.spinRewards[rewardIndex].rejectedAt = new Date().toISOString();
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    writeDb(db);
    return NextResponse.json(db.spinRewards[rewardIndex]);
  } catch (e) {
    console.error("Spin PUT error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
