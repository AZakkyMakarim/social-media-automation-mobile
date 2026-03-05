export type Platform = 'instagram' | 'tiktok' | 'unknown';

export interface ParsedUrl {
  platform: Platform;
  postId: string | null;
  originalUrl: string;
  isValid: boolean;
  error?: string;
}

export function parseUrl(url: string): ParsedUrl {
  const trimmed = url.trim();

  if (!trimmed) {
    return { platform: 'unknown', postId: null, originalUrl: url, isValid: false, error: 'URL tidak boleh kosong' };
  }

  // Instagram patterns
  // https://www.instagram.com/p/{shortcode}/
  // https://www.instagram.com/reel/{shortcode}/
  const igMatch = trimmed.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  if (igMatch) {
    return { platform: 'instagram', postId: igMatch[1], originalUrl: trimmed, isValid: true };
  }

  // TikTok patterns
  // https://www.tiktok.com/@{user}/video/{id}
  // https://vm.tiktok.com/{shortcode}
  // https://vt.tiktok.com/{shortcode}
  const ttLongMatch = trimmed.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttLongMatch) {
    return { platform: 'tiktok', postId: ttLongMatch[1], originalUrl: trimmed, isValid: true };
  }

  const ttShortMatch = trimmed.match(/(?:vm|vt)\.tiktok\.com\/([A-Za-z0-9]+)/);
  if (ttShortMatch) {
    return { platform: 'tiktok', postId: ttShortMatch[1], originalUrl: trimmed, isValid: true };
  }

  return {
    platform: 'unknown',
    postId: null,
    originalUrl: trimmed,
    isValid: false,
    error: 'URL tidak dikenali. Masukkan URL Instagram atau TikTok yang valid.',
  };
}

export function getPlatformLabel(platform: Platform): string {
  switch (platform) {
    case 'instagram': return 'Instagram';
    case 'tiktok': return 'TikTok';
    default: return 'Unknown';
  }
}

export function getPlatformColor(platform: Platform): string {
  switch (platform) {
    case 'instagram': return '#E1306C';
    case 'tiktok': return '#010101';
    default: return '#888888';
  }
}
