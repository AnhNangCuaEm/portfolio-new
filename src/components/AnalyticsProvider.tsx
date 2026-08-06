'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { initSession, trackPageview, getSessionId } from '@/lib/analytics';

/**
 * AnalyticsProvider — Auto-tracks sessions and pageviews.
 * Mount once in the root layout.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname();
  const pageEntryTime = useRef<number>(0);
  const prevPath = useRef<string | null>(null);

  // Initialize session on first load
  useEffect(() => {
    pageEntryTime.current = Date.now();
    initSession();
  }, []);

  // Track pageviews on route change
  useEffect(() => {
    const now = Date.now();

    // Send duration of previous page before recording new pageview
    if (prevPath.current !== null && prevPath.current !== pathname) {
      const duration = now - pageEntryTime.current;
      // Fire-and-forget for the previous page duration update
      // We record the previous pageview with its duration
      const sessionId = getSessionId();
      if (sessionId) {
        navigator.sendBeacon(
          '/api/analytics/pageview',
          JSON.stringify({
            session_id: sessionId,
            path: prevPath.current,
            duration_ms: duration,
          })
        );
      }
    }

    // Record the new pageview
    trackPageview(pathname);

    pageEntryTime.current = now;
    prevPath.current = pathname;

    // On page unload, send final duration
    const handleUnload = () => {
      const sessionId = getSessionId();
      if (!sessionId) return;
      const finalDuration = Date.now() - pageEntryTime.current;
      navigator.sendBeacon(
        '/api/analytics/pageview',
        JSON.stringify({
          session_id: sessionId,
          path: pathname,
          duration_ms: finalDuration,
        })
      );
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [pathname]);

  return null;
}
