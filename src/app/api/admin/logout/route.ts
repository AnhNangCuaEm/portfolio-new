import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const sessionOptions = {
  password: process.env.IRON_SESSION_SECRET || 'fallback-secret-32-chars-minimum!!',
  cookieName: 'admin_session',
  cookieOptions: { secure: process.env.NODE_ENV === 'production' },
};

export async function POST() {
  const session = await getIronSession<{ isAdmin?: boolean }>(await cookies(), sessionOptions);
  session.destroy();
  return NextResponse.json({ success: true });
}
