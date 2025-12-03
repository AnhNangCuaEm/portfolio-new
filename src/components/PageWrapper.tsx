'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

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

    // Create IntersectionObserver for scroll animations
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Function to observe all scroll-animate elements
    const observeElements = () => {
      const elements = document.querySelectorAll('.scroll-animate:not(.animate-visible)');
      elements.forEach((el) => {
        observerRef.current?.observe(el);
      });
    };

    // Initial observation
    observeElements();

    // MutationObserver to detect dynamically added elements (e.g., after data fetch)
    mutationObserverRef.current = new MutationObserver((mutations) => {
      let shouldObserve = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Check if the added node or its children have scroll-animate class
              if (node.classList?.contains('scroll-animate') || node.querySelector?.('.scroll-animate')) {
                shouldObserve = true;
              }
            }
          });
        }
      });
      if (shouldObserve) {
        // Small delay to ensure new elements are fully rendered
        requestAnimationFrame(() => {
          observeElements();
        });
      }
    });

    // Start observing DOM changes
    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
      mutationObserverRef.current?.disconnect();
    };
  }, [pathname]);

  return <div key={pathname}>{children}</div>;
}
