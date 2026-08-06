import { sql } from '@/lib/db';
import { UAParser } from 'ua-parser-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env.IRON_SESSION_SECRET || 'salt')).digest('hex');
}

function getClientIP(req: NextRequest): string {
  // Vercel provides real IP via this header
  const xRealIP = req.headers.get('x-real-ip');
  if (xRealIP) return xRealIP;

  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();

  return '0.0.0.0';
}

async function getGeoInfo(ip: string): Promise<{ country: string; city: string }> {
  // Skip geo lookup for local/private IPs
  if (ip === '0.0.0.0' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1') {
    return { country: 'LO', city: 'Localhost' };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return { country: 'XX', city: 'Unknown' };
    const data = await res.json();
    if (data.status === 'success') {
      return { country: data.countryCode || 'XX', city: data.city || 'Unknown' };
    }
  } catch {
    // Geo lookup failed silently
  }
  return { country: 'XX', city: 'Unknown' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, referrer } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    // Check if session already exists
    const existing = await sql`SELECT session_id FROM sessions WHERE session_id = ${session_id} LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ success: true, existing: true });
    }

    const ip = getClientIP(req);
    const ipHash = hashIP(ip);
    const trackRawIP = process.env.TRACK_RAW_IP === 'true';

    // Parse User-Agent
    const uaString = req.headers.get('user-agent') || '';
    const parser = new UAParser(uaString);
    const uaResult = parser.getResult();

    const deviceType = uaResult.device.type || 'desktop'; // 'mobile' | 'tablet' | 'desktop'
    const browser = `${uaResult.browser.name || 'Unknown'} ${uaResult.browser.version || ''}`.trim();
    const os = `${uaResult.os.name || 'Unknown'} ${uaResult.os.version || ''}`.trim();

    // GeoIP lookup
    const geo = await getGeoInfo(ip);

    await sql`
      INSERT INTO sessions (session_id, ip_hash, ip_raw, country, city, device_type, browser, os, referrer)
      VALUES (
        ${session_id},
        ${ipHash},
        ${trackRawIP ? ip : null},
        ${geo.country},
        ${geo.city},
        ${deviceType},
        ${browser},
        ${os},
        ${referrer || null}
      )
      ON CONFLICT (session_id) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
