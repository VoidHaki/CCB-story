import { NextResponse } from "next/server";

export async function GET() {
  const envKeys = Object.keys(process.env).filter(
    k => !k.toLowerCase().includes("secret") && !k.toLowerCase().includes("password")
  );
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
    envKeys,
  });
}
