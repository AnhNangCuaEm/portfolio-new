import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Derives the best-matching locale from the Accept-Language header.
 * Priority: vi → en → ja (fallback).
 */
function detectLocaleFromHeader(req: NextRequest): string {
  const acceptLang = req.headers.get('accept-language') ?? '';
  const supported = routing.locales as readonly string[];

  // Parse "vi-VN,vi;q=0.9,en;q=0.8" → ['vi', 'en', ...]
  const candidates = acceptLang
    .split(',')
    .map((entry) => {
      const [tag] = entry.trim().split(';');
      return tag.trim().split('-')[0].toLowerCase(); // e.g. "vi-VN" → "vi"
    })
    .filter(Boolean);

  for (const lang of candidates) {
    if (supported.includes(lang)) return lang;
  }

  return routing.defaultLocale;
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the user has already manually chosen a locale (persisted in cookie)
  const savedLocale = req.cookies.get('NEXT_LOCALE')?.value;
  const isValidSaved = savedLocale && (routing.locales as readonly string[]).includes(savedLocale);

  // Only auto-redirect when hitting the root "/" with no locale prefix
  const isRoot = pathname === '/';
  if (isRoot && !isValidSaved) {
    const detected = detectLocaleFromHeader(req);
    // Only redirect away from the default if a non-default locale is detected
    if (detected !== routing.defaultLocale) {
      const url = req.nextUrl.clone();
      url.pathname = `/${detected}`;
      const response = NextResponse.redirect(url);
      // Set cookie so we don't auto-redirect again (30-day expiry)
      response.cookies.set('NEXT_LOCALE', detected, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
      });
      return response;
    }
  }

  return intlMiddleware(req);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ja|en|vi)/:path*'],
};
