import { siteConfig } from './site-config';

export function getWhatsAppLink(message?: string): string {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${siteConfig.whatsapp}${text}`;
}
export function getTelLink(): string { return `tel:${siteConfig.phone}`; }
export function getMapsLink(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address.full)}`;
}
