import { NextResponse } from "next/server";

export async function GET() {
  const envKeys = Object.keys(process.env);
  const info = {
    envKeys,
    cwd: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform,
  };
  return NextResponse.json(info);
}
