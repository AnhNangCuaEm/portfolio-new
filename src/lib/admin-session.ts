import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface AdminSessionData {
  isAdmin?: boolean;
}

function getSessionOptions() {
  const password = process.env.IRON_SESSION_SECRET;

  if (!password) {
    throw new Error('IRON_SESSION_SECRET is not set');
  }

  return {
    password,
    cookieName: 'admin_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
    },
  };
}

export async function getAdminSession() {
  return getIronSession<AdminSessionData>(await cookies(), getSessionOptions());
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const session = await getAdminSession();
    return session.isAdmin === true;
  } catch {
    return false;
  }
}