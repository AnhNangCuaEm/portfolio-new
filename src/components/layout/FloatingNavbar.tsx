'use client';

import { motion, type Variants } from 'framer-motion';
import { Link } from '@/i18n/navigation';
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

// ─── Animation variants ───────────────────────────────────────────────────────

/**
 * Outer motion.div: controls position (y) and width.
 *
 * initial  → a tiny water-drop above the viewport (circular)
 * animate  → slides down to y:0 and expands to full pill width
 *
 * Spring physics: stiffness:200 + damping:18 → light Apple-style bounce.
 */
const pillVariants: Variants = {
  initial: {
    y: -100,
    width: 68,      // equals height → perfect circle on load
    scale: 0.5,
  },
  animate: {
    y: 0,
    width: 'auto', // grows to fit content organically
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 18,
    },
  },
};

/**
 * Inner motion.div: wraps nav text.
 * Fades in after 0.6 s — the pill will have fully expanded by then,
 * so text never bleeds or causes layout shifts during the water-drop animation.
 */
const contentVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      delay: 0.6,
      duration: 0.35,
      ease: 'easeOut' as const,
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloatingNavbar() {
  return (
    /**
     * Positioning shell — fixed, horizontally centred, 16 px from top.
     * Has no background or size of its own; the motion.div carries the pill.
     */
    <header
      className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 z-40"
      aria-label="Main navigation"
    >
      {/*
        ┌─ motion.div ──────────────────────────────────────────────────────┐
        │  Drives the spring animation (y + width + scale).                 │
        │  overflow-hidden keeps children from leaking during expansion.    │
        │  h-14 = 56 px — the fixed pill height (matches initial width).    │
        └───────────────────────────────────────────────────────────────────┘
      */}
      <motion.div
        variants={pillVariants}
        initial="initial"
        animate="animate"
        style={{ height: 68, borderRadius: 9999 }}
        className="overflow-hidden will-change-transform"
      >
        {/*
          ┌─ GlassSurface ────────────────────────────────────────────────┐
          │  width="100%" → always fills motion.div exactly.              │
          │  height="100%" → inherits the fixed 56 px height.             │
          │  SVG displacement-map + backdrop-filter live here only.       │
          └───────────────────────────────────────────────────────────────┘
        */}
        <GlassSurface
          width="100%"
          height="100%"
          displace={2}
          backgroundOpacity={0.1}
          className="h-full"
        >
          {/*
            ┌─ motion.div (content) ──────────────────────────────────────┐
            │  Fades in after 0.6 s — pill is fully open by then.        │
            │  whitespace-nowrap prevents wrapping during width animation. │
            └─────────────────────────────────────────────────────────────┘
          */}
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            className="flex items-center whitespace-nowrap"
          >
            <nav aria-label="Primary">
              <ul className="flex items-center gap-1 px-5 py-2.5">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        'relative px-4 py-2 rounded-full text-base font-semibold',
                        'text-white/85 hover:text-white',
                        'transition-colors duration-200',
                        'hover:bg-white/10',
                        'focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-1',
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}

                {/* Visual divider */}
                <li
                  aria-hidden="true"
                  className="mx-1 h-4 w-px bg-white/20 rounded-full"
                />

                {/* Language toggle */}
                <li className="flex items-center px-2">
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
