/**
 * Extract a clean hostname (e.g. "netflix.com") from either:
 *   - a bare domain: "netflix.com" or "www.netflix.com"
 *   - a full URL:    "https://www.netflix.com/browse"
 */
export function deriveDomain(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  try {
    const withProto = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(withProto);
    let host = url.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.slice(4);
    if (!host.includes('.')) return null;
    return host;
  } catch {
    return null;
  }
}

/**
 * Known service → canonical domain lookup. Used for auto-suggesting a
 * website URL when the user types a common subscription name.
 * Keep this list small + popular. Casing is matched case-insensitively.
 */
export const COMMON_SERVICES: Record<string, string> = {
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  'apple music': 'music.apple.com',
  'youtube premium': 'youtube.com',
  'youtube music': 'music.youtube.com',
  hulu: 'hulu.com',
  'disney+': 'disneyplus.com',
  disney: 'disneyplus.com',
  hbo: 'max.com',
  max: 'max.com',
  'apple tv+': 'tv.apple.com',
  'apple tv': 'tv.apple.com',
  'amazon prime': 'amazon.com',
  prime: 'amazon.com',
  paramount: 'paramountplus.com',
  peacock: 'peacocktv.com',
  crunchyroll: 'crunchyroll.com',
  icloud: 'icloud.com',
  'icloud+': 'icloud.com',
  'google one': 'one.google.com',
  dropbox: 'dropbox.com',
  onedrive: 'onedrive.live.com',
  'microsoft 365': 'microsoft.com',
  office: 'microsoft.com',
  notion: 'notion.so',
  linear: 'linear.app',
  figma: 'figma.com',
  github: 'github.com',
  vercel: 'vercel.com',
  cursor: 'cursor.com',
  openai: 'openai.com',
  chatgpt: 'openai.com',
  claude: 'claude.ai',
  anthropic: 'anthropic.com',
  canva: 'canva.com',
  adobe: 'adobe.com',
  'creative cloud': 'adobe.com',
  photoshop: 'adobe.com',
  nyt: 'nytimes.com',
  'new york times': 'nytimes.com',
  wsj: 'wsj.com',
  medium: 'medium.com',
  substack: 'substack.com',
  audible: 'audible.com',
  kindle: 'amazon.com',
  duolingo: 'duolingo.com',
  headspace: 'headspace.com',
  calm: 'calm.com',
  nordvpn: 'nordvpn.com',
  expressvpn: 'expressvpn.com',
  '1password': '1password.com',
  bitwarden: 'bitwarden.com',
  strava: 'strava.com',
  peloton: 'onepeloton.com',
  'planet fitness': 'planetfitness.com',
  doordash: 'doordash.com',
  uber: 'uber.com',
  'uber one': 'uber.com',
  lyft: 'lyft.com',
  'xbox game pass': 'xbox.com',
  playstation: 'playstation.com',
  'ps plus': 'playstation.com',
  nintendo: 'nintendo.com',
  twitch: 'twitch.tv',
  linkedin: 'linkedin.com',
  tinder: 'tinder.com',
  bumble: 'bumble.com',
  hinge: 'hinge.co',
};

export function guessDomainFromName(name: string): string | null {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  if (COMMON_SERVICES[key]) return COMMON_SERVICES[key];
  // prefix match (e.g. "netflix premium" → "netflix")
  for (const k of Object.keys(COMMON_SERVICES)) {
    if (key.startsWith(k)) return COMMON_SERVICES[k];
  }
  return null;
}

/** Clearbit often has high-quality brand logos. */
export function clearbitLogoUrl(domain: string, size = 128) {
  return `https://logo.clearbit.com/${domain}?size=${size}`;
}

/** Google's public favicon service — fallback when Clearbit has no logo. */
export function googleFaviconUrl(domain: string, size = 128) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

/**
 * First-party logo proxy URL. Using our own `/api/logo` avoids third-party
 * tracking blockers from breaking logos in the UI.
 */
export function logoProxyUrl(domain: string, size = 128) {
  const s = Math.max(16, Math.min(256, Math.round(size)));
  const d = encodeURIComponent(domain);
  return `/api/logo?domain=${d}&size=${s}`;
}
