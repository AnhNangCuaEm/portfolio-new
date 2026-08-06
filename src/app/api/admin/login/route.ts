import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const sessionOptions = {
  password: process.env.IRON_SESSION_SECRET || 'fallback-secret-32-chars-minimum!!',
  cookieName: 'admin_session',
  cookieOptions: { secure: process.env.NODE_ENV === 'production' },
};

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      // Add a small delay to prevent brute force
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const session = await getIronSession<{ isAdmin?: boolean }>(await cookies(), sessionOptions);
    session.isAdmin = true;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
