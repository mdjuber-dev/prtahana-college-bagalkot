import { ApiError, clearAdminToken, getAdminToken, getCurrentAdmin } from './api';

export type AdminUser = {
  id: string;
  email: string;
};

export type AdminAccess =
  | { status: 'configured_missing' }
  | { status: 'guest' }
  | { status: 'authorized'; user: AdminUser }
  | { status: 'unauthorized'; user: AdminUser }
  | { status: 'error'; message: string };

export async function verifyAdminUser(user: AdminUser): Promise<AdminAccess> {
  return { status: 'authorized', user };
}

export async function getCurrentAdminAccess(): Promise<AdminAccess> {
  if (!getAdminToken()) return { status: 'guest' };

  try {
    const { user } = await getCurrentAdmin();
    return { status: 'authorized' as const, user };
  } catch (error) {
    const status = error instanceof ApiError ? error.status : -1;

    // Only a genuine auth rejection invalidates the stored session. A network
    // failure or a backend 5xx (e.g. Render cold start) must NOT sign the admin
    // out, otherwise refreshing the dashboard during a blip loses the session.
    if (status === 401 || status === 403) {
      clearAdminToken();
      return { status: 'guest' };
    }

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unable to verify the admin session.',
    };
  }
}
