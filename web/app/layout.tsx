import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// Inter ships a real variable `wght` axis — it powers the whole UI font AND
// gives the `variable-proximity` demo a font whose weight can be interpolated.
const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReactΩ — AI-native React components",
  description:
    "Premium, accessible, reduced-motion-safe motion, interaction & physics React components. Installable by humans and AI agents via a CLI, shadcn, or an MCP server.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#06060a] font-sans text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
