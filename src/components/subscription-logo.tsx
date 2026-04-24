'use client';

import * as React from 'react';

import {
  deriveDomain,
  guessDomainFromName,
  logoProxyUrl,
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

const LOAD_TIMEOUT_MS = 4000;

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

/** Stable pastel background from name — used for the initials layer. */
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

/**
 * Build an ordered list of candidate logo URLs for a domain.
 * We go first-party → Google → DuckDuckGo → Clearbit so that at
 * least one source works even if the /api/logo proxy isn't deployed
 * yet or an ad blocker blocks a specific third-party host.
 */
function candidateUrls(domain: string, sizePx: number): string[] {
  const targetSize = Math.max(64, sizePx * 4);
  return [
    logoProxyUrl(domain, targetSize),
    `https://www.google.com/s2/favicons?domain=${domain}&sz=${targetSize}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://logo.clearbit.com/${domain}?size=${targetSize}`,
  ];
}

export function SubscriptionLogo({
  name,
  websiteUrl,
  size = 'md',
  tone,
  className,
  /** LCP/hero: load immediately instead of lazy. */
  priority = false,
}: {
  name: string;
  websiteUrl?: string | null;
  size?: Size;
  /** Optional accent tint to match the row (e.g. red for "overdue"). */
  tone?: 'default' | 'amber' | 'red';
  className?: string;
  priority?: boolean;
}) {
  const domain = React.useMemo(() => {
    return deriveDomain(websiteUrl) ?? guessDomainFromName(name);
  }, [websiteUrl, name]);

  const px = imgSizePx[size];

  const sources = React.useMemo(
    () => (domain ? candidateUrls(domain, px) : []),
    [domain, px],
  );

  const [sourceIdx, setSourceIdx] = React.useState(0);
  const [imageOk, setImageOk] = React.useState(false);
  const loadTimeoutRef = React.useRef<number | null>(null);

  const clearLoadTimeout = React.useCallback(() => {
    const id = loadTimeoutRef.current;
    if (id != null) {
      window.clearTimeout(id);
      loadTimeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    setSourceIdx(0);
    setImageOk(false);
  }, [domain]);

  const src = sources[sourceIdx] ?? null;

  React.useEffect(() => {
    if (!src) {
      clearLoadTimeout();
      return;
    }
    setImageOk(false);
    clearLoadTimeout();
    loadTimeoutRef.current = window.setTimeout(() => {
      loadTimeoutRef.current = null;
      setSourceIdx((i) => (i + 1 < sources.length ? i + 1 : i));
    }, LOAD_TIMEOUT_MS);
    return () => clearLoadTimeout();
  }, [src, sources.length, clearLoadTimeout]);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (w < 2 || h < 2) {
      setSourceIdx((i) => (i + 1 < sources.length ? i + 1 : i));
      return;
    }
    clearLoadTimeout();
    setImageOk(true);
  };

  const onImgError = () => {
    clearLoadTimeout();
    setSourceIdx((i) => (i + 1 < sources.length ? i + 1 : i));
  };

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

  return (
    <span
      className={boxBase}
      style={{ background: 'var(--muted)' }}
      aria-hidden
    >
      {/* Base layer: initials always present so the slot never disappears. */}
      <span
        className="absolute inset-0 flex items-center justify-center sub-logo-fallback"
        style={
          {
            '--sub-bg': c.bg,
            '--sub-fg': c.fg,
            '--sub-bg-dark': c.bgDark,
            '--sub-fg-dark': c.fgDark,
            background: 'var(--sub-bg)',
            color: 'var(--sub-fg)',
            zIndex: 0,
            opacity: imageOk ? 0 : 1,
            transition: 'opacity 0.2s ease-out',
          } as React.CSSProperties
        }
      >
        <span className="relative">{initials(name)}</span>
      </span>

      {src ? (
        <span
          className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--muted)] p-0.5"
          style={{
            opacity: imageOk ? 1 : 0,
            pointerEvents: 'none',
            transition: 'opacity 0.2s ease-out',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${domain}-${sourceIdx}`}
            src={src}
            alt=""
            width={px}
            height={px}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            referrerPolicy="no-referrer"
            className="size-full object-contain"
            onLoad={onImgLoad}
            onError={onImgError}
          />
        </span>
      ) : null}
    </span>
  );
}
