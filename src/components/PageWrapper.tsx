'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Handle hash navigation
    const hash = window.location.hash;
    
    if (hash) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Reset scroll when no hash
      window.scrollTo(0, 0);
    }

    // Initialize scroll animations
    const observerOptions = {
      threshold: 0.05,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach((el) => observer.observe(el));
    }, 50);

    return () => observer.disconnect();
  }, [pathname]);

  return <div key={pathname}>{children}</div>;
}
