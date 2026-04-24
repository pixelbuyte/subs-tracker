import { NextResponse } from 'next/server';

import { clearbitLogoUrl, deriveDomain, googleFaviconUrl } from '@/lib/subscriptions/logo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_BYTES = 40; // tiny/empty placeholders
const MAX_SIZE = 256;

function okCacheHeaders(contentType: string) {
  // Cache on the edge/browser. Logos change rarely.
  return {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
  };
}

async function fetchImage(url: string) {
  const res = await fetch(url, {
    // Helps prevent upstream from returning HTML blocks.
    headers: { Accept: 'image/*,*/*;q=0.8' },
    cache: 'no-store',
  });
  if (!res.ok) return null;

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) return null;

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength < MIN_BYTES) return null;

  return { buf, contentType };
}

function duckDuckGoFaviconUrl(domain: string) {
  // Very reliable favicon proxy (1st-party-ish). Returns .ico or png.
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

function unavatarUrl(domain: string) {
  // Another reliable icon source for domains.
  return `https://unavatar.io/${domain}?fallback=false`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get('domain');
  const sizeParam = searchParams.get('size');

  const domain = deriveDomain(input);
  if (!domain) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  }

  const size = Math.max(16, Math.min(MAX_SIZE, Number(sizeParam ?? '128') || 128));

  // Try multiple sources in order of quality/reliability.
  const sources = [
    clearbitLogoUrl(domain, size),
    googleFaviconUrl(domain, size),
    duckDuckGoFaviconUrl(domain),
    unavatarUrl(domain),
  ];

  for (const url of sources) {
    const img = await fetchImage(url);
    if (img) {
      return new NextResponse(img.buf, { status: 200, headers: okCacheHeaders(img.contentType) });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

