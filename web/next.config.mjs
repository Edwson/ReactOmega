/** @type {import('next').NextConfig} */

// Static export for cPanel/Apache hosting under https://edwson.com/ReactOmega/.
// `next build` emits a fully static `out/` folder (no Node server needed).
// basePath is only applied for production builds, so `next dev` still serves
// at http://localhost:3000/ (or :3001) — your dev workflow is unchanged.
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  basePath: isProd ? "/ReactOmega" : "",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
