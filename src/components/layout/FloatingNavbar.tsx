'use client';

import { motion, type Variants } from 'framer-motion';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GlassSurface from '@/components/GlassSurface';

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { href: '/',         label: 'Info'     },
  { href: '/skills',   label: 'Skills'   },
  { href: '/projects', label: 'Projects' },
  { href: '/awards',   label: 'Awards'   },
  { href: '/contact',  label: 'Contact'  },
];

function isActiveNavItem(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

// ─── Animation variants ───────────────────────────────────────────────────────

/**
 * Pill: water-drop entry — starts as a tiny circle above viewport,
 * springs down and expands to full width.
 */
const pillVariants: Variants = {
  initial: { y: -100, width: 68, scale: 0.5 },
  animate: {
    y: 0,
    width: 'auto',
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 18 },
  },
};

/**
 * Content: fades in after 0.6 s — the pill is fully expanded by then,
 * so nav text and the language button appear together in one smooth reveal.
 * The LanguageSwitcher inherits this fade-in automatically because it sits
 * inside this motion.div.
 */
const contentVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { delay: 0.6, duration: 0.35, ease: 'easeOut' },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloatingNavbar() {
  const pathname = usePathname();

  return (
    /**
     * Single fixed shell — horizontally centred, 16 px from top.
     * No extra wrapper below the pill; LanguageSwitcher lives inside.
     */
    <header
      className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 z-40"
      aria-label="Main navigation"
    >
      {/*
        Pill motion.div
        ───────────────
        overflow-hidden keeps children from leaking during the spring-width
        expansion. h-[68px] matches the initial circular width so the
        water-drop entry is a perfect circle.
      */}
      <motion.div
        variants={pillVariants}
        initial="initial"
        animate="animate"
        style={{ height: 68, borderRadius: 9999 }}
        className="overflow-hidden will-change-transform"
      >
        <GlassSurface
          width="100%"
          height="100%"
          displace={2}
          backgroundOpacity={0.1}
          className="h-full"
        >
          {/*
            Content fade-in wrapper
            ───────────────────────
            All children (nav links + language button) share the same
            0.6 s delay, so nothing pops in before the pill finishes opening.
            whitespace-nowrap prevents any wrapping during the width animation.
          */}
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            className="flex items-center whitespace-nowrap"
          >
            <nav aria-label="Primary">
              <ul className="flex items-center gap-1 px-5 py-2.5">

                {/* ── Nav links ─────────────────────────────────────────── */}
                {navItems.map((item) => {
                  const isActive = isActiveNavItem(pathname, item.href);
                  return (
                    <li key={item.href} className="relative">
                      {/* ── Magic Indicator: slides between active tabs ── */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 rounded-full bg-white/10"
                          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                        />
                      )}

                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Link
                          href={item.href}
                          aria-current={isActive ? 'page' : undefined}
                          className={[
                            'relative z-10 block px-4 py-2 rounded-full text-base font-semibold',
                            isActive
                              ? 'text-white'
                              : 'text-white/75 hover:text-white',
                            'transition-colors duration-150',
                            'focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-1',
                          ].join(' ')}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}

                {/* ── Visual divider ────────────────────────────────────── */}
                <li aria-hidden="true" className="mx-1 h-4 w-px bg-white/20 rounded-full" />

                {/*
                  ── Language cycling button ───────────────────────────────
                  Sits as the last item in the same flex-row as the nav links.
                  It receives the contentVariants fade-in automatically because
                  it is a child of the motion.div above — no extra animation
                  wiring needed.

                  On click: EN → JA → VI → EN (handled inside LanguageSwitcher).
                  whileTap scale-down is also defined inside the component.
                */}
                <li className="flex items-center">
                  <LanguageSwitcher />
                </li>

              </ul>
            </nav>
          </motion.div>
        </GlassSurface>
      </motion.div>
    </header>
  );
}
