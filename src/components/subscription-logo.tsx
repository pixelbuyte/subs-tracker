'use client';

import * as React from 'react';

import {
  clearbitLogoUrl,
  deriveDomain,
  googleFaviconUrl,
  guessDomainFromName,
} from '@/lib/subscriptions/logo';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const boxSizes: Record<Size, string> = {
  sm: 'size-7 text-[11px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
};

const imgSizePx: Record<Size, number> = {
  sm: 28,
  md: 32,
  lg: 40,
};

function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return letters || '?';
}

/** Stable pastel background from name — used for the initials fallback. */
function colorFromName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return {
    bg: `hsl(${h} 70% 92%)`,
    fg: `hsl(${h} 55% 30%)`,
    bgDark: `hsl(${h} 35% 18%)`,
    fgDark: `hsl(${h} 80% 78%)`,
  };
}

export function SubscriptionLogo({
  name,
  websiteUrl,
  size = 'md',
  tone,
  className,
}: {
  name: string;
  websiteUrl?: string | null;
  size?: Size;
  /** Optional accent tint to match the row (e.g. red for "overdue"). */
  tone?: 'default' | 'amber' | 'red';
  className?: string;
}) {
  const domain = React.useMemo(() => {
    return deriveDomain(websiteUrl) ?? guessDomainFromName(name);
  }, [websiteUrl, name]);

  const px = imgSizePx[size];

  // Try Clearbit first; on error fall through to Google favicon; on error show initials.
  // We track which "stage" we're on via component state.
  const [stage, setStage] = React.useState<'clearbit' | 'google' | 'fallback'>(
    domain ? 'clearbit' : 'fallback',
  );

  React.useEffect(() => {
    setStage(domain ? 'clearbit' : 'fallback');
  }, [domain]);

  const c = colorFromName(name);
  const toneRing =
    tone === 'amber'
      ? 'ring-1 ring-amber-500/30'
      : tone === 'red'
        ? 'ring-1 ring-red-500/30'
        : '';

  const boxBase = cn(
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md font-semibold',
    boxSizes[size],
    toneRing,
    className,
  );

  if (stage !== 'fallback' && domain) {
    const src = stage === 'clearbit' ? clearbitLogoUrl(domain, 128) : googleFaviconUrl(domain, 128);
    return (
      <span className={boxBase} style={{ background: 'var(--muted)' }} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={px}
          height={px}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setStage((s) => (s === 'clearbit' ? 'google' : 'fallback'))}
        />
      </span>
    );
  }

  // Pure-CSS initials fallback — no network, always works.
  // We pass both light + dark pastel values as CSS vars and let Tailwind
  // swap them via the `.dark` class on the root.
  return (
    <span
      className={cn(boxBase, 'sub-logo-fallback')}
      aria-hidden
      style={
        {
          '--sub-bg': c.bg,
          '--sub-fg': c.fg,
          '--sub-bg-dark': c.bgDark,
          '--sub-fg-dark': c.fgDark,
          background: 'var(--sub-bg)',
          color: 'var(--sub-fg)',
        } as React.CSSProperties
      }
    >
      <span className="relative">{initials(name)}</span>
    </span>
  );
}
