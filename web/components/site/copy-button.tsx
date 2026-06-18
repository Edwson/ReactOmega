"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({ text, label, className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-neutral-300 transition-colors hover:border-violet-500/50",
        className,
      )}
    >
      <span className="truncate">{label ?? text}</span>
      <span className={cn("shrink-0", copied ? "text-emerald-400" : "text-violet-400")}>{copied ? "✓ copied" : "copy"}</span>
    </button>
  );
}
