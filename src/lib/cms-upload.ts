import { uploadFile } from './neon-api';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_PDF_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

/** Map admin field paths to upload folder names. */
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

export async function uploadCmsFile(
  file: File,
  category: string,
): Promise<{ url: string | null; error?: string }> {
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !isVideo) {
    return { url: null, error: 'Invalid file type. Allowed: JPG, PNG, WEBP images or MP4/WEBM videos.' };
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return { url: null, error: `File size exceeds maximum allowed limit of ${Math.round(maxSize / (1024 * 1024))}MB.` };
  }

  try {
    return { url: await uploadFile(file, resolveUploadCategory(category)) };
  } catch (error) {
    return { url: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function uploadCmsPdf(
  file: File,
  category: string,
): Promise<{ url: string | null; error?: string }> {
  if (file.type !== 'application/pdf') {
    return { url: null, error: 'Invalid file type. Only PDF files are allowed.' };
  }
  if (file.size > MAX_PDF_SIZE) {
    return { url: null, error: 'File size exceeds maximum allowed limit of 20MB.' };
  }

  try {
    return { url: await uploadFile(file, resolveUploadCategory(category)) };
  } catch (error) {
    return { url: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteCmsFile(publicUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!publicUrl.startsWith('/uploads/')) {
    return { success: false, error: 'Only files uploaded through the Neon API can be deleted here.' };
  }
  return { success: true };
}
