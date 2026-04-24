import * as React from "react";

import { cn } from "@/lib/utils";

export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 fx-grid opacity-[0.55] dark:opacity-[0.35]" />
      <div className="absolute -left-32 -top-32 size-[40rem] rounded-full fx-blob fx-blob-a" />
      <div className="absolute -right-40 top-16 size-[46rem] rounded-full fx-blob fx-blob-b" />
      <div className="absolute left-1/2 top-[55%] size-[56rem] -translate-x-1/2 rounded-full fx-blob fx-blob-c" />
      <div className="absolute inset-0 bg-background/40 dark:bg-background/20 backdrop-blur-[1px]" />
    </div>
  );
}

