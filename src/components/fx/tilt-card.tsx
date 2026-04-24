"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Higher = more dramatic tilt.
   * Default tuned for subtle UI depth.
   */
  maxTiltDeg?: number;
  /**
   * Disables pointer-based tilt (still keeps hover glow styles).
   */
  disabled?: boolean;
};

export function TiltCard({
  children,
  className,
  maxTiltDeg = 10,
  disabled = false,
}: TiltCardProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const clearTilt = React.useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty("--tilt-rx", "0deg");
    ref.current.style.setProperty("--tilt-ry", "0deg");
    ref.current.style.setProperty("--tilt-mx", "50%");
    ref.current.style.setProperty("--tilt-my", "50%");
  }, []);

  const onMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      const el = ref.current;
      if (!el) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / Math.max(1, r.width);
        const py = (e.clientY - r.top) / Math.max(1, r.height);

        const cx = px * 2 - 1; // [-1..1]
        const cy = py * 2 - 1; // [-1..1]

        const rx = (-cy * maxTiltDeg).toFixed(2);
        const ry = (cx * maxTiltDeg).toFixed(2);

        el.style.setProperty("--tilt-rx", `${rx}deg`);
        el.style.setProperty("--tilt-ry", `${ry}deg`);
        el.style.setProperty("--tilt-mx", `${(px * 100).toFixed(2)}%`);
        el.style.setProperty("--tilt-my", `${(py * 100).toFixed(2)}%`);
      });
    },
    [disabled, maxTiltDeg],
  );

  React.useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("fx-tilt", className)}
      onPointerMove={onMove}
      onPointerLeave={clearTilt}
      onBlur={clearTilt}
    >
      {children}
    </div>
  );
}

