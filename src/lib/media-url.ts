import { API_URL } from './api';

export function getMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, API_URL);
  }
  if (trimmed.startsWith('/uploads/')) {
    return `${API_URL}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    return `${API_URL}/${trimmed}`;
  }
  return trimmed;
}

export function getMediaUrlWithVersion(url: string | undefined | null, updatedAt?: string | number): string {
  const resolved = getMediaUrl(url);
  if (!resolved || updatedAt == null) return resolved;
  const separator = resolved.includes('?') ? '&' : '?';
  return `${resolved}${separator}v=${updatedAt}`;
}
