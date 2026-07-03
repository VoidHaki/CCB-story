import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { readDb, writeDb, SpinReward } from "@/lib/db";

const COOLDOWN_DURATION = 2 * 60 * 60 * 1000; // 2 hours in ms

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId");
    
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

    // 3. Find if there's any spin in the last 2 hours matching this table OR device ID OR fingerprint
    const recentSpin = db.spinRewards.find(reward => {
      const rewardTime = new Date(reward.timestamp).getTime();
      const isWithinCooldown = (now - rewardTime) < COOLDOWN_DURATION;
      
      const matchesTable = reward.tableId === String(tableId);
      const matchesDevice = reward.deviceId && reward.deviceId === deviceId;
      const matchesFingerprint = reward.fingerprint && reward.fingerprint === fingerprint;

      return isWithinCooldown && (matchesTable || matchesDevice || matchesFingerprint);
    });

    // 4. Find if there is any active pending reward that needs to be claimed
    // Discount rewards expire after 2 hours; other rewards (coins, food, etc) expire after 24 hours.
    const activePendingReward = db.spinRewards.find(reward => {
      if (reward.status !== "pending") return false;
      
      const matchesTable = reward.tableId === String(tableId);
      const matchesDevice = reward.deviceId && reward.deviceId === deviceId;
      const matchesFingerprint = reward.fingerprint && reward.fingerprint === fingerprint;
      
      if (!(matchesTable || matchesDevice || matchesFingerprint)) return false;

      const rewardTime = new Date(reward.timestamp).getTime();
      const expiryDuration = reward.rewardType === "discount" ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const isExpired = (now - rewardTime) >= expiryDuration;

      return !isExpired;
    });

    let canSpin = true;
    let cooldownRemaining = 0;

    if (recentSpin) {
      canSpin = false;
      const recentTime = new Date(recentSpin.timestamp).getTime();
      cooldownRemaining = Math.max(0, COOLDOWN_DURATION - (now - recentTime));
    }

    // If they have an active pending reward, we also prevent spinning until they claim/resolve it
    if (activePendingReward) {
      canSpin = false;
    }

    const response = NextResponse.json({
      canSpin,
      cooldownRemaining,
      activePendingReward: activePendingReward || null,
      deviceId
    });

    // Save device ID cookie for 1 year
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
    console.error("Error in spin status:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
