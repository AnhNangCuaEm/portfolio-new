import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, event_type, component, element_id, metadata } = body;

    if (!session_id || !event_type) {
      return NextResponse.json({ error: 'session_id and event_type required' }, { status: 400 });
    }

    await sql`
      INSERT INTO events (session_id, event_type, component, element_id, metadata)
      VALUES (
        ${session_id},
        ${event_type},
        ${component ?? null},
        ${element_id ?? null},
        ${metadata ? JSON.stringify(metadata) : null}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
