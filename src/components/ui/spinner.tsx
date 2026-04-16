import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'size-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-foreground',
        className,
      )}
      aria-label="Loading"
    />
  );
}

