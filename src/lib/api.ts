// Centralized API Client for Prarthana PU College Management System

/**
 * Canonical production backend (Render). This is the single source of truth so a
 * missing or mistyped VITE_API_BASE_URL can never break the production build again.
 */
const PRODUCTION_API_URL = 'https://prarthanaclgbgk.onrender.com';

/** Hosts that must never be used as the backend API origin in a production build. */
const FORBIDDEN_API_HOST_PATTERNS = [
  /localhost/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /workers\.dev$/i,
  /\.pages\.dev$/i,
];

/**
 * The frontend is served from these hosts. They are static asset hosts only and do
 * NOT expose /api, so they can never be a valid API base URL.
 */
const FRONTEND_HOSTS = [
  'prarthanapucollegebagalkot.in',
  'www.prarthanapucollegebagalkot.in',
];

const getBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL) as string | undefined;
  const candidate = String(envUrl || '').trim().replace(/\/+$/, '');

  if (candidate) {
    try {
      const parsed = new URL(candidate);
      const host = parsed.hostname;
      const isForbidden = FORBIDDEN_API_HOST_PATTERNS.some((pattern) => pattern.test(host));
      const isFrontendHost = FRONTEND_HOSTS.includes(host.toLowerCase());

      // In a production build, reject dev/preview hosts and the frontend's own domain.
      if (!import.meta.env.DEV && (isForbidden || isFrontendHost)) {
        console.warn(
          `[api] Ignoring invalid VITE_API_BASE_URL host "${host}". Falling back to the production Render API.`,
        );
        return PRODUCTION_API_URL;
      }

      // Never allow an insecure API origin when the page itself is served over HTTPS
      // (browsers block mixed content, which surfaces as a generic network failure).
      if (
        parsed.protocol === 'http:' &&
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        !isForbidden
      ) {
        parsed.protocol = 'https:';
        return parsed.origin;
      }

      return parsed.origin + (parsed.pathname !== '/' ? parsed.pathname.replace(/\/+$/, '') : '');
    } catch {
      console.warn(`[api] VITE_API_BASE_URL is not a valid URL. Falling back to the production Render API.`);
      return PRODUCTION_API_URL;
    }
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  return PRODUCTION_API_URL;
};

export const API_URL = getBaseUrl();
const TOKEN_KEY = 'prarthana_admin_token';

export type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Error thrown by the API client.
 * `status` is the HTTP status when the server answered, or 0 when the request never
 * reached the server (DNS failure, offline, blocked by CORS). Callers use this to
 * distinguish "you are logged out" (401) from "the network hiccuped" (0/5xx) so a
 * transient blip never destroys a valid admin session.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly isNetworkError: boolean;

  constructor(message: string, status: number, options?: { cause?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = status === 0;
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}, retries = 2): Promise<T> {
  const url = `${API_URL}${path}`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      let response: Response;
      try {
        response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...(options.headers || {}),
          },
        });
      } catch (netErr) {
        // A thrown fetch() means the request never reached the server: DNS failure,
        // offline client, blocked mixed content, or a CORS pre-flight rejection.
        // Surface the actual API host so misconfiguration is immediately visible.
        let host = API_URL;
        try {
          host = new URL(API_URL).host;
        } catch {
          /* keep raw value */
        }
        lastError = new ApiError(
          `Unable to reach the server at ${host}. Please check your internet connection and try again.`,
          0,
          { cause: netErr },
        );
        console.error(`[api] Network request to ${url} failed:`, netErr);
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw lastError;
      }

      const result = await response.json().catch(() => ({
        success: false,
        error: response.status === 503 ? 'Database unavailable' : `HTTP ${response.status}: ${response.statusText}`,
      }));

      if (response.status === 401 && !path.includes('/api/auth/login')) {
        clearAdminToken();
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login?expired=1';
        }
      }

      if (!response.ok || !result.success) {
        lastError = new ApiError(
          result.error || `Request failed with status ${response.status}`,
          response.status,
        );
        if (attempt < retries && response.status >= 500) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw lastError;
      }

      return result.data as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt >= retries) throw lastError;
    }
  }

  throw lastError || new Error('Request failed');
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Health Check
export async function checkHealth() {
  const url = `${API_URL}/api/health`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({ success: false, error: 'Failed to parse response' }));
  if (!res.ok || !data.success) {
    return { success: false, error: data.error || 'Database unavailable' };
  }
  return { success: true, database: data.database };
}

// Authentication
export async function loginAdmin(email: string, password: string) {
  const data = await request<{ token: string; user: { id: string; email: string; role?: string } }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAdminToken(data.token);
  return data;
}

export async function getCurrentAdmin() {
  return request<{ user: { id: string; email: string } }>('/api/auth/me');
}

// Site CMS
export async function getSiteCms() {
  return request<any[]>('/api/site-cms');
}

export async function getSiteCmsRow(key = 'site_config') {
  return request<any | null>(`/api/site-cms/${encodeURIComponent(key)}`);
}

export async function upsertSiteCms(key: string, value: Record<string, unknown>) {
  return request<any>(`/api/site-cms/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

// Admissions
export async function listAdmissions(limit = 500) {
  return request<any[]>(`/api/admissions?limit=${limit}`);
}

export async function createAdmission(admission: Record<string, unknown>) {
  return request<any[]>('/api/admissions', { method: 'POST', body: JSON.stringify(admission) });
}

export async function updateAdmission(column: string, value: string, payload: Record<string, unknown>) {
  return request<any>(`/api/admissions/${encodeURIComponent(column)}/${encodeURIComponent(value)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdmission(column: string, value: string) {
  return request<boolean>(`/api/admissions/${encodeURIComponent(column)}/${encodeURIComponent(value)}`, { method: 'DELETE' });
}

// General Enquiries
export async function listGeneralEnquiries(limit = 500) {
  return request<any[]>(`/api/general-enquiries?limit=${limit}`);
}

export async function createGeneralEnquiry(payload: Record<string, unknown>) {
  return request<any[]>('/api/general-enquiries', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateGeneralEnquiry(id: string, payload: Record<string, unknown>) {
  return request<any>(`/api/general-enquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteGeneralEnquiry(id: string) {
  return request<boolean>(`/api/general-enquiries/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function deleteEnquiry(id: string) {
  return request<boolean>(`/api/enquiries/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Careers
export async function listCareerJobs(admin = false) {
  return request<any[]>(`/api/career-jobs${admin ? '?admin=true' : ''}`);
}

export async function getCareerJob(slug: string) {
  return request<any | null>(`/api/career-jobs/${encodeURIComponent(slug)}`);
}

export async function createCareerJob(payload: Record<string, unknown>) {
  return request<any>('/api/career-jobs', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateCareerJob(id: string, payload: Record<string, unknown>) {
  return request<any>(`/api/career-jobs/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteCareerJob(id: string) {
  return request<boolean>(`/api/career-jobs/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function listCareerApplications() {
  return request<any[]>('/api/career-applications');
}

export async function createCareerApplication(payload: Record<string, unknown>) {
  return request<any>('/api/career-applications', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateCareerApplication(id: string, payload: Record<string, unknown>) {
  return request<any>(`/api/career-applications/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteCareerApplication(id: string) {
  return request<boolean>(`/api/career-applications/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getCareerResumeUrl(path: string) {
  const data = await request<{ url: string }>(`/api/career-resumes?path=${encodeURIComponent(path)}`);
  return data.url;
}

// Dashboard Configs
export async function listDashboardConfigs() {
  return request<any[]>('/api/dashboard-configs');
}

export async function createDashboardConfig(payload: Record<string, unknown>) {
  return request<any>('/api/dashboard-configs', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateDashboardConfig(id: string, payload: Record<string, unknown>) {
  return request<any>(`/api/dashboard-configs/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteDashboardConfig(id: string) {
  return request<boolean>(`/api/dashboard-configs/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Admin Users
export async function listAdminUsers() {
  return request<any[]>('/api/admin-users');
}

// Chatbot Knowledge
export async function listChatbotKnowledge() {
  return request<any[]>('/api/chatbot-knowledge');
}

export async function syncChatbotKnowledge(knowledge: any[], previousIds: string[]) {
  return request<string[]>('/api/chatbot-knowledge/sync', {
    method: 'POST',
    body: JSON.stringify({ knowledge, previousIds }),
  });
}

// Media Assets Management
export async function listMediaAssets(category = 'all') {
  return request<any[]>(`/api/media${category ? `?category=${encodeURIComponent(category)}` : ''}`);
}

export async function deleteMediaAsset(id: string) {
  return request<boolean>(`/api/media/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function replaceMediaAsset(id: string, file: File) {
  return request<any>(`/api/media/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      file: { name: file.name, type: file.type, size: file.size, data: await fileToDataUrl(file) },
    }),
  });
}

// Gallery Management
export async function listGalleryItems(admin = false) {
  return request<any[]>(`/api/gallery${admin ? '?admin=true' : ''}`);
}

export async function createGalleryItem(payload: Record<string, unknown>) {
  return request<any>('/api/gallery', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateGalleryItem(id: string, payload: Record<string, unknown>) {
  return request<any>(`/api/gallery/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteGalleryItem(id: string) {
  return request<boolean>(`/api/gallery/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Announcements Management
export async function listAnnouncements(admin = false) {
  return request<any[]>(`/api/announcements${admin ? '?admin=true' : ''}`);
}

export async function getAnnouncement(id: string) {
  return request<any | null>(`/api/announcements/${encodeURIComponent(id)}`);
}

export async function createAnnouncement(payload: Record<string, unknown>) {
  return request<any>('/api/announcements', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateAnnouncement(id: string, payload: Record<string, unknown>) {
  return request<any>(`/api/announcements/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteAnnouncement(id: string) {
  return request<boolean>(`/api/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' });
}


// Helpers
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

export async function uploadFile(file: File, category: string) {
  const data = await request<{ url: string }>('/api/uploads', {
    method: 'POST',
    body: JSON.stringify({
      category,
      file: { name: file.name, type: file.type, size: file.size, data: await fileToDataUrl(file) },
    }),
  });
  return data.url;
}

export async function uploadCareerResume(file: File) {
  return request<{ path: string; url: string }>('/api/career-resumes', {
    method: 'POST',
    body: JSON.stringify({
      file: { name: file.name, type: file.type, size: file.size, data: await fileToDataUrl(file) },
    }),
  });
}

