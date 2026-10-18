import fs from "fs";

// Auto-bootstrap .env from .env.example if missing on a fresh git clone
if (!fs.existsSync(".env") && fs.existsSync(".env.example")) {
  try {
    fs.copyFileSync(".env.example", ".env");
    console.log("ℹ️ Auto-created .env from .env.example for zero-config git checkout");
  } catch (err) {
    // Non-fatal if read-only filesystem
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;
