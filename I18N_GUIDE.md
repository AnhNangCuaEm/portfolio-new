# Hướng dẫn sử dụng tính năng đa ngôn ngữ (Internationalization)

## Tổng quan
Website portfolio hỗ trợ 2 ngôn ngữ:
- **日本語 (Tiếng Nhật)** - Ngôn ngữ mặc định
- **English (Tiếng Anh)**

## Cấu trúc thư mục

```
messages/
  ├── ja.json        # Bản dịch tiếng Nhật (mặc định)
  └── en.json        # Bản dịch tiếng Anh

src/
  ├── i18n/
  │   ├── config.ts        # Cấu hình ngôn ngữ
  │   └── translations.ts  # Load các bản dịch
  ├── contexts/
  │   └── LanguageContext.tsx  # Context quản lý ngôn ngữ
  ├── hooks/
  │   └── useLanguage.ts      # Hook để sử dụng ngôn ngữ
  └── components/
      └── LanguageSwitcher.tsx  # Component chuyển đổi ngôn ngữ
```

## Cách sử dụng

### 1. Thêm bản dịch mới

Thêm các key/value mới vào `messages/ja.json` và `messages/en.json`:

**messages/ja.json:**
```json
{
  "nav": {
    "info": "情報",
    "skills": "スキル"
  },
  "hero": {
    "greeting": "こんにちは、私は",
    "role": "フルスタック開発者です"
  }
}
```

**messages/en.json:**
```json
{
  "nav": {
    "info": "Info",
    "skills": "Skills"
  },
  "hero": {
    "greeting": "Hello, I'm",
    "role": "a Full-Stack Developer"
  }
}
```

### 2. Sử dụng trong Component

```tsx
'use client';

import { useLanguage } from '@/hooks/useLanguage';

export default function MyComponent() {
  const { messages, locale, setLocale } = useLanguage();

  return (
    <div>
      <h1>{messages.hero.greeting}</h1>
      <p>{messages.hero.role}</p>
      <p>Current language: {locale}</p>
      
      {/* Chuyển đổi ngôn ngữ */}
      <button onClick={() => setLocale('ja')}>日本語</button>
      <button onClick={() => setLocale('en')}>English</button>
    </div>
  );
}
```

### 3. Sử dụng LocalizedLink cho Navigation

```tsx
import LocalizedLink from '@/components/LocalizedLink';

export default function Navigation() {
  return (
    <nav>
      <LocalizedLink href="/">Home</LocalizedLink>
      <LocalizedLink href="/about">About</LocalizedLink>
      <LocalizedLink href="/projects">Projects</LocalizedLink>
    </nav>
  );
}
```

**Lưu ý**: Luôn dùng `LocalizedLink` thay vì `Link` để giữ ngôn ngữ trong URL!

### 4. Sử dụng LanguageSwitcher Component

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  return (
    <header>
      <nav>
        {/* Your navigation items */}
      </nav>
      <LanguageSwitcher />
    </header>
  );
}
```

### 5. Truy cập thông tin ngôn ngữ

```tsx
const { messages, locale, setLocale } = useLanguage();

// messages: Tất cả bản dịch cho ngôn ngữ hiện tại
// locale: Ngôn ngữ hiện tại ('ja' hoặc 'en')
// setLocale: Function để thay đổi ngôn ngữ (sẽ redirect tới URL mới)
```

## URL Structure

Website sử dụng cấu trúc URL với locale prefix:

- `/ja` - Trang chủ tiếng Nhật (mặc định)
- `/en` - Trang chủ tiếng Anh
- `/ja/about` - Trang About tiếng Nhật
- `/en/about` - Trang About tiếng Anh

**Middleware tự động redirect:**
- Truy cập `/` → redirect tới `/ja` (hoặc `/en` nếu browser language là English)
- Truy cập `/about` → redirect tới `/ja/about` (hoặc locale đã chọn)

## Tính năng

✅ **URL-based routing**: Ngôn ngữ được nhúng trong URL (`/ja`, `/en`)  
✅ **Lưu trữ tự động**: Ngôn ngữ được chọn sẽ được lưu vào cookie và localStorage  
✅ **Type-safe**: TypeScript hỗ trợ autocomplete cho tất cả các key dịch  
✅ **Tiếng Nhật làm ngôn ngữ mặc định**: Website sẽ hiển thị tiếng Nhật khi lần đầu truy cập  
✅ **Auto-detection**: Tự động phát hiện ngôn ngữ từ Accept-Language header  
✅ **SEO-friendly**: Mỗi ngôn ngữ có URL riêng, tốt cho SEO  
✅ **HTML lang attribute**: Tự động cập nhật `<html lang="...">` theo URL  

## Thêm ngôn ngữ mới

1. Thêm ngôn ngữ vào `src/i18n/config.ts`:
```ts
export type Locale = 'ja' | 'en' | 'vi'; // Thêm 'vi' cho tiếng Việt

export const locales: Locale[] = ['ja', 'en', 'vi'];

export const localeNames: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
  vi: 'Tiếng Việt',
};
```

2. Tạo file `messages/vi.json` với nội dung tương tự

3. Import vào `src/i18n/translations.ts`:
```ts
import viMessages from '@/../../messages/vi.json';

const messages: Record<Locale, Messages> = {
  en: enMessages,
  ja: jaMessages,
  vi: viMessages, // Thêm dòng này
};
```

## Best Practices

- ✅ Luôn cập nhật cả 2 file JSON khi thêm text mới
- ✅ Sử dụng key có ý nghĩa: `messages.nav.home` thay vì `messages.text1`
- ✅ Nhóm các key liên quan: `nav.*`, `hero.*`, `footer.*`
- ✅ Kiểm tra cả 2 ngôn ngữ trước khi deploy
- ✅ Sử dụng font Noto Sans JP cho tiếng Nhật (đã được cấu hình sẵn)

## Font Support

Website đã được cấu hình với:
- **Montserrat**: Cho tiếng Anh và các ngôn ngữ Latin
- **Noto Sans JP**: Cho tiếng Nhật

Các font này được load từ Google Fonts và có sẵn trong CSS variables:
- `--font-montserrat`
- `--font-noto-sans-jp`
