import { sql } from '@/lib/db';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const sessionOptions = {
  password: process.env.IRON_SESSION_SECRET || 'fallback-secret-32-chars-minimum!!',
  cookieName: 'admin_session',
  cookieOptions: { secure: process.env.NODE_ENV === 'production' },
};

async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getIronSession<{ isAdmin?: boolean }>(await cookies(), sessionOptions);
    return session.isAdmin === true;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '30'; // days
  const days = Math.min(Math.max(parseInt(range, 10) || 30, 1), 365);

  try {
    // Overview counts
    const [overview] = await sql`
      SELECT
        COUNT(DISTINCT s.session_id) AS total_visitors,
        COUNT(pv.id)                 AS total_pageviews,
        COUNT(DISTINCT CASE WHEN s.created_at >= NOW() - INTERVAL '1 day' THEN s.session_id END) AS visitors_today,
        COUNT(DISTINCT CASE WHEN s.created_at >= NOW() - INTERVAL '7 days' THEN s.session_id END) AS visitors_week,
        ROUND(AVG(pv.duration_ms) / 1000.0, 1) AS avg_duration_seconds
      FROM sessions s
      LEFT JOIN pageviews pv ON pv.session_id = s.session_id
      WHERE s.created_at >= NOW() - (${days} || ' days')::INTERVAL
    `;

    // Daily visitors (for chart)
    const dailyVisitors = await sql`
      SELECT
        DATE_TRUNC('day', created_at)::DATE AS date,
        COUNT(DISTINCT session_id) AS visitors,
        COUNT(*) AS sessions
      FROM sessions
      WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    // Top pages
    const topPages = await sql`
      SELECT
        path,
        COUNT(*) AS views,
        COUNT(DISTINCT session_id) AS unique_views,
        ROUND(AVG(duration_ms) / 1000.0, 1) AS avg_duration_seconds
      FROM pageviews
      WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `;

    // Device breakdown
    const devices = await sql`
      SELECT
        COALESCE(device_type, 'desktop') AS device_type,
        COUNT(*) AS count
      FROM sessions
      WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY device_type
      ORDER BY count DESC
    `;

    // Browser breakdown
    const browsers = await sql`
      SELECT
        SPLIT_PART(browser, ' ', 1) AS browser_name,
        COUNT(*) AS count
      FROM sessions
      WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY browser_name
      ORDER BY count DESC
      LIMIT 8
    `;

    // OS breakdown
    const operatingSystems = await sql`
      SELECT
        SPLIT_PART(os, ' ', 1) AS os_name,
        COUNT(*) AS count
      FROM sessions
      WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY os_name
      ORDER BY count DESC
      LIMIT 8
    `;

    // Top countries
    const countries = await sql`
      SELECT
        country,
        city,
        COUNT(*) AS count
      FROM sessions
      WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY country, city
      ORDER BY count DESC
      LIMIT 15
    `;

    // Top events (click components)
    const topEvents = await sql`
      SELECT
        component,
        event_type,
        COUNT(*) AS count
      FROM events
      WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
        AND component IS NOT NULL
      GROUP BY component, event_type
      ORDER BY count DESC
      LIMIT 15
    `;

    // Top projects clicked
    const topProjects = await sql`
      SELECT
        element_id,
        metadata->>'name' AS project_name,
        COUNT(*) AS clicks
      FROM events
      WHERE component = 'project-card'
        AND created_at >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY element_id, project_name
      ORDER BY clicks DESC
      LIMIT 10
    `;

    // Top photos clicked
    const topPhotos = await sql`
      SELECT
        element_id,
        metadata->>'caption' AS caption,
        metadata->>'location' AS location,
        COUNT(*) AS clicks
      FROM events
      WHERE component = 'gallery-photo'
        AND created_at >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY element_id, caption, location
      ORDER BY clicks DESC
      LIMIT 10
    `;

    // Recent visitors
    const recentVisitors = await sql`
      SELECT
        s.session_id,
        s.ip_hash,
        s.country,
        s.city,
        s.device_type,
        s.browser,
        s.os,
        s.referrer,
        s.created_at,
        COUNT(pv.id) AS pageviews
      FROM sessions s
      LEFT JOIN pageviews pv ON pv.session_id = s.session_id
      WHERE s.created_at >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY s.session_id, s.ip_hash, s.country, s.city, s.device_type, s.browser, s.os, s.referrer, s.created_at
      ORDER BY s.created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      overview,
      dailyVisitors,
      topPages,
      devices,
      browsers,
      operatingSystems,
      countries,
      topEvents,
      topProjects,
      topPhotos,
      recentVisitors,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
