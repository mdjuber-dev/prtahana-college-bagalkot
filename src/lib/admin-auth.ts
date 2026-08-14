import { clearAdminToken, getAdminToken, getCurrentAdmin } from './api';

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
    return { status: 'authorized', user };
  } catch (error) {
    clearAdminToken();
    return { status: 'guest' };
  }
}
