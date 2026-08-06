'use client';

import { useCallback } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * useTrack — React hook for easy event tracking
 *
 * Usage:
 *   const { trackClick } = useTrack();
 *   <button onClick={() => trackClick('hero-cta', 'btn-contact', { label: 'Contact Me' })}>
 */
export function useTrack() {
  const trackClick = useCallback(
    (component: string, elementId?: string, metadata?: Record<string, unknown>) => {
      trackEvent(component, elementId, metadata);
    },
    []
  );

  return { trackClick };
}
