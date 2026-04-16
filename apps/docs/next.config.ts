import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@reactomega/ui'],
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      '@reactomega/ui': '../../packages/ui/src/index.ts',
    },
  },
};

export default nextConfig;
