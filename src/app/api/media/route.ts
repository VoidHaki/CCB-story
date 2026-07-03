import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const publicDir = path.join(process.cwd(), "public");
  
  const getFiles = (subDir: string) => {
    const dirPath = path.join(publicDir, subDir);
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        return [];
      }
      return fs.readdirSync(dirPath).filter(file => {
        const fullPath = path.join(dirPath, file);
        return !file.startsWith(".") && fs.statSync(fullPath).isFile();
      });
    } catch (e) {
      console.error(`Error reading public/${subDir}:`, e);
      return [];
    }
  };

  return NextResponse.json({
    logo: getFiles("logo"),
    gallery: getFiles("gallery"),
    reels: getFiles("reels"),
    media: getFiles("media"),
  });
}
