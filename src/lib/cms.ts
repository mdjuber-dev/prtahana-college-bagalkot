import { supabase } from './supabase-config';

export interface SiteConfigRow {
  id: string;
  key: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const HERO_SLIDE_LIMIT = 2;

export function sanitizeSiteConfigHeroImages<T extends Record<string, unknown> | null>(value: T): T {
  if (!value || !Array.isArray(value.heroSlides)) return value;

  return {
    ...value,
    heroSlides: value.heroSlides.slice(0, HERO_SLIDE_LIMIT),
  } as T;
}

/** Strip non-CMS metadata keys before persisting to site_cms.value */
export function sanitizeSiteConfigPayload(value: Record<string, unknown>): Record<string, unknown> {
  const { updated_at, created_at, id, ...cmsValue } = value;
  return sanitizeSiteConfigHeroImages(cmsValue) as Record<string, unknown>;
}

export async function fetchSiteConfig(): Promise<Record<string, unknown> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('site_cms')
      .select('value')
      .eq('key', 'site_config')
      .maybeSingle();

    if (error) {
      console.error('fetchSiteConfig error:', error.message);
      return null;
    }

    const value = (data as Pick<SiteConfigRow, 'value'> | null)?.value ?? null;
    return value ? sanitizeSiteConfigHeroImages(value) : null;
  } catch (err) {
    console.error('fetchSiteConfig unexpected error:', err);
    return null;
  }
}

export async function upsertSiteConfig(value: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase not configured');

  const cmsValue = sanitizeSiteConfigPayload(value);
  const row = {
    key: 'site_config',
    value: cmsValue,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('site_cms')
    .upsert(row, { onConflict: 'key' })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
