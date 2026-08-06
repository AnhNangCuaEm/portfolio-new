import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      // Add a small delay to prevent brute force
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const session = await getAdminSession();
    session.isAdmin = true;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
