import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build run without overwriting the folder a running `next dev` serves
  // from (which makes dev answer "Internal Server Error"), e.g. NEXT_DIST_DIR=.next-build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Keep the dev "N" badge away from the admin sidebar's bottom-left buttons.
  devIndicators: { position: "bottom-right" },
  // Gallery uploads from /admin go through a server action; allow photos up to 8 MB.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
