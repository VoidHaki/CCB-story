import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Export env keys to a public static file during build for environment auditing
try {
  const envKeys = Object.keys(process.env).filter(
    key => !key.toLowerCase().includes("secret") && !key.toLowerCase().includes("password")
  );
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, "env-keys.txt"), envKeys.join("\n"), "utf-8");
  console.log("Wrote env keys successfully:", envKeys.length);
} catch (e) {
  console.error("Error writing env keys:", e);
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
