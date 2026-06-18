"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` when the user has requested reduced motion.
 * Every ReactOmega motion component honors this and degrades to a calm,
 * non-animated state — accessibility is a contract, not an afterthought.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return reduced;
}
