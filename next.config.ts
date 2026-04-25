import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com"
      },
      {
        protocol: "https",
        hostname: "pikwizard.com"
      },
      {
        protocol: "https",
        hostname: "thumbs.wbm.im"
      }
    ]
  }
};

export default nextConfig;
