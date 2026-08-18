import { API_URL } from './api';

export function getMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, API_URL);
  }
  if (url.startsWith('/uploads/')) {
    return `${API_URL}${url}`;
  }
  return url;
}

export function getMediaUrlWithVersion(url: string | undefined | null, updatedAt?: string | number): string {
  const resolved = getMediaUrl(url);
  if (!resolved || updatedAt == null) return resolved;
  const separator = resolved.includes('?') ? '&' : '?';
  return `${resolved}${separator}v=${updatedAt}`;
}
