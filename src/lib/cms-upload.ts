import { supabase } from './supabase-config';

const CMS_BUCKET = 'cms-assets';
const LEGACY_BUCKET = 'cms-media';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_PDF_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

/** Map admin field paths to storage folder names */
export function resolveUploadCategory(pathOrCategory: string): string {
  const p = pathOrCategory.toLowerCase();
  if (p.includes('logo') || p.startsWith('siteconfig') || p.startsWith('branding')) return 'branding';
  if (p.startsWith('hero') || p.includes('heroslide')) return 'hero';
  if (p.startsWith('about')) return 'about';
  if (p.startsWith('leadership') || p.includes('faculty') || p.includes('president') || p.includes('principal')) return 'leadership';
  if (p.includes('course')) return 'courses';
  if (p.includes('achievement') || p.includes('poster') || p.includes('ach-')) return 'achievements';
  if (p.includes('gallery') || p.includes('gal-')) return 'gallery';
  if (p.startsWith('transport')) return 'transport';
  if (p.startsWith('hostel')) return 'hostel';
  if (p.startsWith('pamphlet')) return 'pamphlet';
  if (p.includes('popup')) return 'branding';
  return pathOrCategory.replace(/[^a-z0-9/-]/gi, '') || 'general';
}

function extractStoragePath(publicUrl: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(publicUrl);
    const marker = '/storage/v1/object/public/';
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const rest = url.pathname.slice(idx + marker.length);
    const slash = rest.indexOf('/');
    if (slash === -1) return null;
    const bucket = rest.slice(0, slash);
    const path = decodeURIComponent(rest.slice(slash + 1));
    if (!bucket || !path) return null;
    return { bucket, path };
  } catch {
    return null;
  }
}

async function uploadToBucket(bucket: string, filename: string, file: File, upsert = true) {
  if (!supabase) return { error: new Error('Supabase storage is not configured.') };
  const { error } = await supabase.storage.from(bucket).upload(filename, file, { upsert });
  if (error) return { error };
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return { url: data.publicUrl };
}

export async function uploadCmsFile(
  file: File,
  category: string,
): Promise<{ url: string | null; error?: string }> {
  if (!supabase) return { url: null, error: 'Supabase storage is not configured.' };

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !isVideo) {
    return { url: null, error: 'Invalid file type. Allowed: JPG, PNG, WEBP images or MP4/WEBM videos.' };
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return { url: null, error: `File size exceeds maximum allowed limit of ${Math.round(maxSize / (1024 * 1024))}MB.` };
  }

  const folder = resolveUploadCategory(category);
  const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const primary = await uploadToBucket(CMS_BUCKET, filename, file);
  if (primary.url) return { url: primary.url };

  const fallback = await uploadToBucket(LEGACY_BUCKET, filename, file);
  if (fallback.url) return { url: fallback.url };

  return { url: null, error: primary.error?.message || fallback.error?.message || 'Upload failed. Storage bucket not found — apply Supabase migrations.' };
}

export async function uploadCmsPdf(
  file: File,
  category: string,
): Promise<{ url: string | null; error?: string }> {
  if (!supabase) return { url: null, error: 'Supabase storage is not configured.' };
  if (file.type !== 'application/pdf') {
    return { url: null, error: 'Invalid file type. Only PDF files are allowed.' };
  }
  if (file.size > MAX_PDF_SIZE) {
    return { url: null, error: 'File size exceeds maximum allowed limit of 20MB.' };
  }

  const folder = resolveUploadCategory(category);
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.pdf`;

  const result = await uploadToBucket(CMS_BUCKET, filename, file);
  if (result.url) return { url: result.url };
  return { url: null, error: result.error?.message || 'PDF upload failed. Storage bucket not found — apply Supabase migrations.' };
}

export async function deleteCmsFile(publicUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase storage is not configured.' };
  const parsed = extractStoragePath(publicUrl);
  if (!parsed) return { success: false, error: 'Could not parse storage URL for deletion.' };

  const { error } = await supabase.storage.from(parsed.bucket).remove([parsed.path]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
