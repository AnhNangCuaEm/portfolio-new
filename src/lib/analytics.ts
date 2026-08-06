/**
 * analytics.ts — Client-side analytics tracking library
 *
 * Usage:
 *   import { trackEvent } from '@/lib/analytics';
 *   trackEvent('project-card', 'project-social-app', { name: 'Social App' });
 */

const SESSION_KEY = 'analytics_session_id';
const SESSION_INIT_KEY = 'analytics_session_initialized';

/** Generate a random session ID */
function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Get or create a persistent session ID */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Initialize session — sends IP, device, geo info to server */
export async function initSession(): Promise<void> {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();

  // Only init once per browser session
  if (sessionStorage.getItem(SESSION_INIT_KEY) === sessionId) return;

  try {
    await fetch('/api/analytics/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        referrer: document.referrer || null,
      }),
      // Use keepalive so it fires even on page unload
      keepalive: true,
    });
    sessionStorage.setItem(SESSION_INIT_KEY, sessionId);
  } catch {
    // Silently fail — analytics should never break the page
  }
}

/** Track a pageview */
export async function trackPageview(path: string, durationMs?: number): Promise<void> {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    await fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        path,
        duration_ms: durationMs ?? null,
      }),
      keepalive: true,
    });
  } catch {
    // Silently fail
  }
}

/**
 * Track a custom event (e.g., click on project card, gallery photo)
 *
 * @param component  Component name e.g. 'project-card', 'gallery-photo', 'contact-link'
 * @param elementId  Unique element identifier e.g. project title slug, photo ID
 * @param metadata   Optional extra data e.g. { name: 'Social App', caption: 'Tokyo 2024' }
 */
export async function trackEvent(
  component: string,
  elementId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: 'click',
        component,
        element_id: elementId ?? null,
        metadata: metadata ?? null,
      }),
      keepalive: true,
    });
  } catch {
    // Silently fail
  }
}
