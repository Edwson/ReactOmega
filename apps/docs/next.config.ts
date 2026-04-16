import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@reactomega/ui'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
