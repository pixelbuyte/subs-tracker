"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Scroll3DProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Overall strength of the effect. Keep small for "premium" feel.
   */
  intensity?: number;
  /**
   * If true, effect is disabled (still renders children).
   */
  disabled?: boolean;
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function Scroll3D({ children, className, intensity = 1, disabled = false }: Scroll3DProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (media?.matches) return;

    let active = true;

    const update = () => {
      if (!active || !el) return;
      const r = el.getBoundingClientRect();

      // Progress: -1 (far above) → 0 (centered) → +1 (far below)
      const viewportH = Math.max(1, window.innerHeight);
      const centerY = r.top + r.height / 2;
      const t = clamp((centerY - viewportH / 2) / (viewportH * 0.9), -1, 1);

      // Depth / parallax tuning
      const ry = t * 6 * intensity; // rotateY
      const rx = -t * 4.5 * intensity; // rotateX
      const ty = t * 18 * intensity; // translateY
      const tz = (1 - Math.abs(t)) * 18 * intensity; // pop forward near center

      el.style.setProperty("--s3d-rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--s3d-ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--s3d-ty", `${ty.toFixed(2)}px`);
      el.style.setProperty("--s3d-tz", `${tz.toFixed(2)}px`);
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    // Only animate when near viewport for perf.
    const io = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((e) => e.isIntersecting);
        if (isIntersecting) {
          update();
          window.addEventListener("scroll", onScroll, { passive: true });
          window.addEventListener("resize", onScroll);
          onScroll();
        } else {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onScroll);
        }
      },
      { root: null, threshold: 0, rootMargin: "300px 0px 300px 0px" },
    );

    io.observe(el);

    return () => {
      active = false;
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [disabled, intensity]);

  return (
    <div ref={ref} className={cn("fx-scroll3d", className)}>
      {children}
    </div>
  );
}

