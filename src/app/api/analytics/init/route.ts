import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(64) UNIQUE NOT NULL,
        ip_hash VARCHAR(64),
        ip_raw VARCHAR(45),
        country VARCHAR(2),
        city VARCHAR(100),
        device_type VARCHAR(20),
        browser VARCHAR(100),
        os VARCHAR(100),
        referrer TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create pageviews table
    await sql`
      CREATE TABLE IF NOT EXISTS pageviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(64) NOT NULL,
        path TEXT NOT NULL,
        duration_ms INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create events table
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(64) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        component VARCHAR(100),
        element_id VARCHAR(200),
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pageviews_session_id ON pageviews(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON pageviews(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_component ON events(component)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC)`;

    return NextResponse.json({ success: true, message: 'Database tables initialized' });
  } catch (error) {
    console.error('DB init error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
