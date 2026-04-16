import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@reactomega/ui'],
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: {
      resolveAlias: {
        '@reactomega/ui': '../../packages/ui/src/index.ts',
      },
    },
  },
};

export default nextConfig;
