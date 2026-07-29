import type { Metadata } from "next";
import { Montserrat, Noto_Sans_JP } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from "next/navigation";
import { routing } from '@/i18n/routing';
import PageWrapper from "@/components/PageWrapper";
import Galaxy from "@/components/Galaxy";
import FloatingNavbar from "@/components/layout/FloatingNavbar";
import HamburgerMenu from "@/components/layout/Hamburger";
import { Analytics } from '@vercel/analytics/next';
import "../globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Le Ly's personal portfolio website",
  icons: {
    icon: "/favicon.png",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as 'ja' | 'en' | 'vi')) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${montserrat.variable} ${notoSansJP.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {/* Galaxy background — fixed, full-screen, z below everything */}
          <div className="fixed inset-0 w-full h-screen pointer-events-none" style={{ zIndex: -10 }}>
            <Galaxy />
          </div>

          {/* Floating Navbar — desktop, fixed top-center, z-50 */}
          <FloatingNavbar />

          {/* Hamburger — mobile only (md:hidden inside) */}
          <HamburgerMenu />

          {/* Main content */}
          <div className="relative z-10">
            <PageWrapper>
              {children}
              <Analytics />
            </PageWrapper>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
