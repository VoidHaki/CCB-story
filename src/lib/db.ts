import fs from "fs";
import path from "path";
import crypto from "crypto";

const isVercel = !!process.env.VERCEL;
const isKv = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const dbPath = isVercel
  ? path.join("/tmp", "db.json")
  : path.join(process.cwd(), "db.json");

const lockPath = isVercel
  ? path.join("/tmp", "db.lock")
  : path.join(process.cwd(), "db.lock");

// Auto-clean lock file on start-up (if not using KV)
try {
  if (!isKv && fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
  }
} catch (e) {
  // Ignore
}

export interface Table {
  id: string;
  name: string;
}

export interface CafeRequest {
  id: string;
  tableId: string;
  tableName: string;
  type: string; // Dynamic type to support waiter, bill, and reward claims
  time: string;
  status: "pending" | "resolved";
  resolvedTime?: string;
}

export interface SpinReward {
  id: string;
  tableId: string;
  tableName: string;
  reward: string;
  rewardType: "coins" | "discount" | "food" | "mystery" | "bonus" | "luck";
  rewardValue: string | number;
  icon: string;
  token: string; // HMAC encrypted token for verification
  timestamp: string;
  expiresAt: string; // 2h or 24h expiry
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

// Raw read (async to support Vercel KV)
export async function readDb(): Promise<DatabaseSchema> {
  if (isKv) {
    try {
      const url = `${process.env.KV_REST_API_URL}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["GET", "ccb_database"]),
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          const parsed = JSON.parse(data.result);
          if (!parsed.spinRewards) parsed.spinRewards = [];
          if (!parsed.requests) parsed.requests = [];
          if (!parsed.history) parsed.history = [];
          if (!parsed.tables) parsed.tables = [];
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading from Vercel KV:", e);
    }
    return defaultDb;
  }

  // File system fallback
  try {
    if (!fs.existsSync(dbPath)) {
      // Try to load initial bundled db.json if it exists
      const staticDbPath = path.join(process.cwd(), "db.json");
      let initialDb = defaultDb;
      if (fs.existsSync(staticDbPath)) {
        try {
          const data = fs.readFileSync(staticDbPath, "utf-8");
          initialDb = JSON.parse(data);
        } catch (e) {
          initialDb = defaultDb;
        }
      }
      fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }
    const data = fs.readFileSync(dbPath, "utf-8");
    if (!data || data.trim() === "") {
      return defaultDb;
    }
    const parsed = JSON.parse(data);
    if (!parsed.spinRewards) parsed.spinRewards = [];
    if (!parsed.requests) parsed.requests = [];
    if (!parsed.history) parsed.history = [];
    if (!parsed.tables) parsed.tables = [];
    return parsed;
  } catch (e) {
    console.error("Error reading db.json file:", e);
    return defaultDb;
  }
}

// Raw write (async to support Vercel KV)
export async function writeDb(db: DatabaseSchema): Promise<void> {
  if (isKv) {
    try {
      const url = `${process.env.KV_REST_API_URL}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["SET", "ccb_database", JSON.stringify(db)]),
        cache: "no-store"
      });
      if (!res.ok) {
        throw new Error(`KV set failed with status ${res.status}`);
      }
    } catch (e) {
      console.error("Error writing to Vercel KV:", e);
    }
    return;
  }

  // File system fallback
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing db.json file:", e);
  }
}

// Lock acquisition helper (async with KV support)
async function acquireLock(retries = 300, delay = 15): Promise<void> {
  if (isKv) {
    const lockKey = "ccb_database_lock";
    for (let i = 0; i < retries; i++) {
      try {
        const url = `${process.env.KV_REST_API_URL}`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(["SET", lockKey, "locked", "NX", "PX", "5000"]),
          cache: "no-store"
        });
        if (res.ok) {
          const data = await res.json();
          if (data.result === "OK") {
            return;
          }
        }
      } catch (e) {
        console.error("Error acquiring KV lock:", e);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    throw new Error("Database lock timeout: Could not acquire KV lock");
  }

  // File system fallback
  for (let i = 0; i < retries; i++) {
    try {
      const fd = fs.openSync(lockPath, "wx");
      fs.closeSync(fd);
      return;
    } catch (e: any) {
      if (e.code === "EEXIST") {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw e;
      }
    }
  }
  throw new Error("Database lock timeout: Could not acquire file lock");
}

// Lock release helper (async with KV support)
async function releaseLock(): Promise<void> {
  if (isKv) {
    const lockKey = "ccb_database_lock";
    try {
      const url = `${process.env.KV_REST_API_URL}`;
      await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["DEL", lockKey]),
        cache: "no-store"
      });
    } catch (e) {
      console.error("Error releasing KV lock:", e);
    }
    return;
  }

  // File system fallback
  try {
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  } catch (e) {
    // Ignore error
  }
}

// Run a code block inside a safe transaction (reads are concurrent and lock-free)
export async function runTransaction<T>(
  action: (db: DatabaseSchema) => T | Promise<T>,
  readonly = false
): Promise<T> {
  if (readonly) {
    const db = await readDb();
    return await action(db);
  }

  await acquireLock();
  try {
    const db = await readDb();
    const result = await action(db);
    await writeDb(db);
    return result;
  } finally {
    await releaseLock();
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
