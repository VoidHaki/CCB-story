import { NextResponse } from "next/server";
import { runTransaction, SpinReward, generateRewardToken } from "@/lib/db";

const TABLET_REWARDS = [
  { reward: "+25 Coins",    type: "coins"    as const, value: 25,           icon: "🪙", weight: 35 },
  { reward: "10% Off",      type: "discount" as const, value: "10%",        icon: "🏷️", weight: 0.5 },
  { reward: "+20 Coins",    type: "coins"    as const, value: 20,           icon: "🪙", weight: 40 },
  { reward: "Free Coffee",  type: "food"     as const, value: "Free Coffee",icon: "☕", weight: 0.1 },
  { reward: "+15 Coins",    type: "coins"    as const, value: 15,           icon: "🪙", weight: 45 },
  { reward: "+30 Coins",    type: "coins"    as const, value: 30,           icon: "🪙", weight: 30 },
  { reward: "+20 Coins",    type: "coins"    as const, value: 20,           icon: "🪙", weight: 40 },
  { reward: "Free Brownie", type: "food"     as const, value: "Free Brownie",icon: "🍫", weight: 0.1 },
  { reward: "+10 Coins",    type: "coins"    as const, value: 10,           icon: "🪙", weight: 10 },
  { reward: "15% Off",      type: "discount" as const, value: "15%",        icon: "🏷️", weight: 0.3 },
  { reward: "+15 Coins",    type: "coins"    as const, value: 15,           icon: "🪙", weight: 45 },
  { reward: "+5 Coins",     type: "coins"    as const, value: 5,            icon: "🪙", weight: 5 },
];

function pickWeightedReward() {
  const total = TABLET_REWARDS.reduce((s, r) => s + r.weight, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < TABLET_REWARDS.length; i++) {
    const r = TABLET_REWARDS[i];
    if (rand < r.weight) {
      return { picked: r, index: i };
    }
    rand -= r.weight;
  }
  return { picked: TABLET_REWARDS[0], index: 0 };
}

export async function POST() {
  try {
    const { picked, index: rewardIndex } = pickWeightedReward();
    const now = Date.now();
    const id = `spin-tablet-${now}-${Math.floor(Math.random() * 100000)}`;
    const timestamp = new Date(now).toISOString();
    const expiresAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();
    const token = generateRewardToken(id, "tablet", picked.reward);

    const spinReward: SpinReward = {
      id,
      tableId: "tablet",
      tableName: "Tablet Wheel",
      reward: picked.reward,
      rewardType: picked.type,
      rewardValue: picked.value,
      icon: picked.icon,
      token,
      timestamp,
      expiresAt,
      status: "claimed",
      claimedAt: timestamp,
    };



    const result = await runTransaction((db) => {
      db.spinRewards.unshift(spinReward);
      return { success: true, reward: spinReward, rewardIndex };
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
  }
}
