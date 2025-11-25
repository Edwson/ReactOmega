import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ReactOmega',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
