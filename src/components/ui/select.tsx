'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-md border border-[var(--border)] bg-card px-3 pr-9 text-sm text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
    </div>
  );
}

