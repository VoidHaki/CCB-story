import fs from "fs";
import path from "path";
import crypto from "crypto";

const dbPath = path.join(process.cwd(), "db.json");

export interface Table {
  id: string;
  name: string;
}

export interface CafeRequest {
  id: string;
  tableId: string;
  tableName: string;
  type: "Waiter Call" | "Ask For Bill";
  time: string;
  status: "pending" | "resolved";
  resolvedTime?: string;
}

export interface SpinReward {
  id: string;
  tableId: string;
  tableName: string;
  reward: string;
  rewardType: "coins" | "discount" | "food" | "mystery" | "bonus";
  rewardValue: string | number;
  icon: string;
  token: string; // HMAC encrypted token for verification
  timestamp: string;
  expiresAt: string; // 24h expiry
  status: "pending" | "claimed" | "rejected" | "expired";
  claimedAt?: string;
  rejectedAt?: string;
  deviceId?: string;
  fingerprint?: string;
}

export interface DatabaseSchema {
  tables: Table[];
  requests: CafeRequest[];
  history: CafeRequest[];
  spinRewards: SpinReward[];
}

const defaultDb: DatabaseSchema = {
  tables: [
    { id: "1", name: "Table 1" },
    { id: "2", name: "Table 2" },
    { id: "5", name: "Table 5" },
    { id: "12", name: "Table 12" },
    { id: "15", name: "Table 15" },
    { id: "21", name: "Table 21" }
  ],
  requests: [],
  history: [],
  spinRewards: []
};

export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2), "utf-8");
      return defaultDb;
    }
    const data = fs.readFileSync(dbPath, "utf-8");
    const parsed = JSON.parse(data);
    // Ensure spinRewards key exists in older db files
    if (!parsed.spinRewards) {
      parsed.spinRewards = [];
    }
    return parsed;
  } catch (e) {
    console.error("Error reading db.json:", e);
    return defaultDb;
  }
}

export function writeDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing db.json:", e);
  }
}

// Generate a secure HMAC token for a spin reward
export function generateRewardToken(rewardId: string, tableId: string, reward: string): string {
  const secret = process.env.SPIN_SECRET || "ccb-spin-secret-2026";
  const payload = `${rewardId}:${tableId}:${reward}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// Verify a spin reward token
export function verifyRewardToken(rewardId: string, tableId: string, reward: string, token: string): boolean {
  const expected = generateRewardToken(rewardId, tableId, reward);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
