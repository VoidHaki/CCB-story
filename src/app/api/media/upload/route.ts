import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or target type" }, { status: 400 });
    }

    const allowedTypes = ["logo", "gallery", "reels", "media"];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const publicDir = path.join(process.cwd(), "public");
    const targetDir = path.join(publicDir, type);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Sanitize filename to prevent directory traversal or system conflicts
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const targetPath = path.join(targetDir, sanitizedFilename);

    fs.writeFileSync(targetPath, buffer);
    return NextResponse.json({ success: true, filename: sanitizedFilename });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e.message || "Failed to upload file" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { type, filename } = await request.json();
    if (!type || !filename) {
      return NextResponse.json({ error: "Missing type or filename" }, { status: 400 });
    }

    const allowedTypes = ["logo", "gallery", "reels", "media"];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), "public");
    const filePath = path.join(publicDir, type, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (e: any) {
    console.error("Delete asset error:", e);
    return NextResponse.json({ error: e.message || "Failed to delete file" }, { status: 500 });
  }
}
