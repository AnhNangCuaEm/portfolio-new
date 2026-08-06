import { cookies } from 'next/headers';

/**
 * Root layout — required by Next.js App Router.
 * Reads NEXT_LOCALE cookie to set the correct lang attribute.
 * Locale pages ([locale]/layout.tsx) handle all the styling and UI.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read locale from cookie (set by middleware) for correct lang attribute
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'ja';

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
