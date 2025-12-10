'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === 'ja' ? 'en' : 'ja';

  const handleLocaleChange = () => {
    router.replace(pathname, { locale: otherLocale });
  };

  return (
    <button
      onClick={handleLocaleChange}
      className="cursor-pointer"
      aria-label="Switch language"
    >
      <svg
        width="24px"
        height="24px"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="#912bde"
        strokeWidth="1.5"
      >
        <path d="M12,23 C18.0751322,23 23,18.0751322 23,12 C23,5.92486775 18.0751322,1 12,1 C5.92486775,1 1,5.92486775 1,12 C1,18.0751322 5.92486775,23 12,23 Z M12,23 C15,23 16,18 16,12 C16,6 15,1 12,1 C9,1 8,6 8,12 C8,18 9,23 12,23 Z M2,16 L22,16 M2,8 L22,8" />
      </svg>
    </button>
  );
}