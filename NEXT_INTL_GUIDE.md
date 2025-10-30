# i18n Migration Guide - Next-intl

## ✅ Đã hoàn thành migration sang next-intl!

Dự án đã được đơn giản hóa bằng cách sử dụng **next-intl** thay vì custom i18n implementation.

---

## 📁 Cấu trúc mới

```
src/
├── i18n/
│   ├── routing.ts      # Cấu hình routing (defineRouting)
│   ├── navigation.ts   # Export Link, useRouter, usePathname từ next-intl
│   └── request.ts      # Server-side i18n config
├── middleware.ts       # Sử dụng createIntlMiddleware
└── app/
    └── [locale]/
        └── layout.tsx  # Wrap với NextIntlClientProvider

messages/
├── en.json            # English translations
└── ja.json            # Japanese translations
```

---

## 🎯 Cách sử dụng

### 1. **Client Components** - Sử dụng hooks

```tsx
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';

export default function MyComponent() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div>
      <h1>{t('hero.greeting')}</h1>
      <p>{t('hero.description')}</p>
      
      {/* Link tự động thêm locale vào URL */}
      <Link href="/about">About</Link>
      <Link href="/products">Products</Link>
      
      <p>Current locale: {locale}</p>
    </div>
  );
}
```

### 2. **Server Components** - Sử dụng async functions

```tsx
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function ServerComponent() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <div>
      <h1>{t('hero.greeting')}</h1>
      <Link href="/about">About</Link>
    </div>
  );
}
```

### 3. **Navigation với locale**

```tsx
'use client';

import { useRouter, usePathname } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: 'ja' | 'en') => {
    // Tự động chuyển sang cùng page với locale mới
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div>
      <button onClick={() => changeLanguage('ja')}>日本語</button>
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  );
}
```

---

## 🔄 So sánh với cách cũ

### ❌ Cách cũ (Custom implementation)

```tsx
// Phức tạp - cần custom hook và wrapper component
import { useLanguage } from '@/hooks/useLanguage';
import LocalizedLink from '@/components/LocalizedLink';

const { messages, locale, setLocale } = useLanguage();
<LocalizedLink href="/about">{messages.nav.about}</LocalizedLink>
```

### ✅ Cách mới (next-intl)

```tsx
// Đơn giản - dùng built-in hooks và Link
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const t = useTranslations();
<Link href="/about">{t('nav.about')}</Link>
```

---

## 🎨 Ưu điểm của next-intl

1. ✅ **Đơn giản hơn** - Không cần tự build wrapper components
2. ✅ **Type-safe** - TypeScript support tốt hơn
3. ✅ **Performance** - Optimized cho Next.js App Router
4. ✅ **Built-in features** - Nhiều tính năng sẵn có (formatting, pluralization, v.v.)
5. ✅ **SEO-friendly** - Automatic locale handling trong metadata
6. ✅ **Less boilerplate** - Ít code hơn, dễ maintain hơn

---

## 📝 Translation Files

Giữ nguyên cấu trúc `messages/` folder:

```json
// messages/ja.json
{
  "hero": {
    "greeting": "こんにちは",
    "description": "..."
  },
  "nav": {
    "info": "情報",
    "skills": "スキル"
  }
}

// messages/en.json
{
  "hero": {
    "greeting": "Hello",
    "description": "..."
  },
  "nav": {
    "info": "Info",
    "skills": "Skills"
  }
}
```

---

## 🚀 Các tính năng nâng cao

### Namespaces
```tsx
const t = useTranslations('HomePage'); // Chỉ load translations của HomePage
```

### Rich text formatting
```tsx
t.rich('welcome', {
  b: (chunks) => <strong>{chunks}</strong>
})
```

### Number & Date formatting
```tsx
import { useFormatter } from 'next-intl';

const format = useFormatter();
format.number(1000); // "1,000" (en) or "1,000" (ja)
format.dateTime(new Date(), { dateStyle: 'long' });
```

---

## 🔗 Documentation

- [next-intl docs](https://next-intl-docs.vercel.app/)
- [Next.js App Router Integration](https://next-intl-docs.vercel.app/docs/getting-started/app-router)

---

## ⚠️ Breaking Changes

1. `LocalizedLink` → `Link` from `@/i18n/navigation`
2. `useLanguage()` → `useTranslations()` and `useLocale()`
3. `messages.hero.greeting` → `t('hero.greeting')`
4. Server components phải dùng async functions với `getTranslations()`

---

Giờ đây i18n đơn giản và mạnh mẽ hơn nhiều! 🎉
