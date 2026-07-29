'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { motion } from 'framer-motion';

// ─── Locale cycle order ────────────────────────────────────────────────────────
const CYCLE: Array<{ code: string; short: string; label: string }> = [
  { code: 'en', short: 'EN', label: 'English'     },
  { code: 'ja', short: 'JA', label: '日本語'       },
  { code: 'vi', short: 'VI', label: 'Tiếng Việt'  },
];

function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale}; max-age=${60 * 60 * 24 * 30}; path=/; samesite=lax`;
}

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10M12 2c-2.5 3-4 6.5-4 10s1.5 7 4 10" />
      <path d="M2 12h20M2 8.5h20M2 15.5h20" />
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * LanguageSwitcher
 *
 * Desktop (≥ md):
 *   Single cycling button — Globe + locale abbreviation.
 *   Click advances EN → JA → VI → EN.
 *
 * Mobile (< md):
 *   Inline EN / JA / VI tap strip.
 *   Active locale highlighted; others dimmed.
 */
export default function LanguageSwitcher() {
  const locale   = useLocale();
  const router   = useRouter();
  const pathname = usePathname();

  const currentIdx = CYCLE.findIndex((l) => l.code === locale);
  const current    = CYCLE[currentIdx] ?? CYCLE[0];

  function handleCycle() {
    const nextIdx    = (currentIdx + 1) % CYCLE.length;
    const nextLocale = CYCLE[nextIdx];
    setLocaleCookie(nextLocale.code);
    router.replace(pathname, { locale: nextLocale.code });
  }

  function handleSelect(code: string) {
    if (code === locale) return;
    setLocaleCookie(code);
    router.replace(pathname, { locale: code });
  }

  // ── Mobile strip ────────────────────────────────────────────────────────────
  const MobileStrip = (
    <div
      className="flex items-center gap-1 md:hidden"
      role="group"
      aria-label="Language selection"
    >
      {CYCLE.map((lang, i) => (
        <span key={lang.code} className="flex items-center">
          <button
            onClick={() => handleSelect(lang.code)}
            aria-current={locale === lang.code ? 'true' : undefined}
            aria-label={`Switch to ${lang.label}`}
            className={[
              'text-sm font-semibold tracking-wide px-1 py-0.5 rounded transition-all duration-200 cursor-pointer',
              locale === lang.code
                ? 'text-white underline underline-offset-2 decoration-2'
                : 'text-white/40 hover:text-white/70',
            ].join(' ')}
          >
            {lang.short}
          </button>
          {i < CYCLE.length - 1 && (
            <span className="text-white/25 text-xs select-none mx-0.5">/</span>
          )}
        </span>
      ))}
    </div>
  );

  // ── Desktop cycling button ──────────────────────────────────────────────────
  const DesktopButton = (
    <motion.button
      onClick={handleCycle}
      whileTap={{ scale: 0.9 }}
      aria-label={`Current language: ${current.label}. Click to cycle languages.`}
      title={`Switch language (${current.label})`}
      className={[
        'hidden md:flex items-center gap-1.5',
        'px-3 py-2 rounded-full',
        'text-white/80 hover:text-white',
        'hover:bg-white/10 active:bg-white/15',
        'transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-1',
        'cursor-pointer select-none',
      ].join(' ')}
    >
      <GlobeIcon />
      <span className="text-sm font-bold tracking-widest leading-none">
        {current.short}
      </span>
    </motion.button>
  );

  return (
    <>
      {MobileStrip}
      {DesktopButton}
    </>
  );
}