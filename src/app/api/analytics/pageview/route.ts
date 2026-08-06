import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, path, duration_ms } = body;

    if (!session_id || !path) {
      return NextResponse.json({ error: 'session_id and path required' }, { status: 400 });
    }

    await sql`
      INSERT INTO pageviews (session_id, path, duration_ms)
      VALUES (${session_id}, ${path}, ${duration_ms ?? null})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pageview API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
