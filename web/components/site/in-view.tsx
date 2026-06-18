"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mounts its children only once they scroll near the viewport — keeps a page
 *  full of live canvas/physics demos smooth. */
export function InView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setShow(true)),
      { rootMargin: "200px" },
    );
    io.observe(el);
    // Fallback: if already near the viewport at mount, show without waiting for
    // the observer's first callback (dev StrictMode + fast navigations can drop it,
    // which would leave above-the-fold cards permanently empty).
    const raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      if (r.top < vh + 200 && r.bottom > -200) setShow(true);
    });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={cn(className)}>
      {show ? children : null}
    </div>
  );
}
