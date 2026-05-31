import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Vercel Blob Storage — used for all admin-uploaded images
        // allowPrivateIp: true resolves the NAT64 private-IP rejection in local dev
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        // Firebase Storage fallback
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        // Google Cloud Storage (Firebase Storage CDN)
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
    // Suppress the NAT64/private-IP SSRF check for blob storage in local dev.
    // Vercel Blob Storage is safe to use — this only affects the Next.js dev-server proxy.
    dangerouslyAllowSVG: false,
    unoptimized: false,
  },
};

export default nextConfig;
