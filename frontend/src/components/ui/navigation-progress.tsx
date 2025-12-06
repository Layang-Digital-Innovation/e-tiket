'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/store/navigation/useNavigationStore';

export default function NavigationProgress({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const completeTimeout = useRef<NodeJS.Timeout | null>(null);

  const { isNavigating, progress, startNavigation, setProgress, finishNavigation, resetNavigation } = useNavigationStore();

  // Intercept all link clicks to start loading immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      // Ignore if modifier keys are pressed (new tab/window)
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      if (link && link.href && !link.target && link.href.startsWith(window.location.origin)) {
        // Ignore same page links (anchors or same path)
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(link.href);
        if (currentUrl.pathname === targetUrl.pathname && currentUrl.search === targetUrl.search) return;

        // Internal navigation detected - start loading
        startNavigation();

        // Start progressive loading
        let currentProgress = 10;
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }

        progressInterval.current = setInterval(() => {
          currentProgress += Math.random() * 15;

          if (currentProgress < 90) {
            setProgress(currentProgress);
          } else {
            setProgress(90);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
          }
        }, 100);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [startNavigation, setProgress]);

  // Complete loading when pathname changes
  useEffect(() => {
    // If not navigating, don't do anything (prevents running on initial mount if not needed)
    // But we need to check if we SHOULD be finishing.
    // Actually, usePathname change IS the signal that navigation finished.

    // Clear any existing timers
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    if (completeTimeout.current) {
      clearTimeout(completeTimeout.current);
    }

    // Finish navigation immediately on path change
    finishNavigation();

    // Reset after animation completes (500ms to be safe for 300ms transition)
    completeTimeout.current = setTimeout(() => {
      resetNavigation();
    }, 500);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (completeTimeout.current) {
        clearTimeout(completeTimeout.current);
      }
    };
  }, [pathname, searchParams, finishNavigation, resetNavigation]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      className="fixed left-0 right-0 z-50 h-[0.5px] bg-transparent"
      style={{ marginLeft: 'var(--sidebar-width, 0px)' }}
    >
      <div
        className={`h-full bg-primary ${className} transition-all duration-300 ease-out shadow-lg`}
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
        }}
      />
    </div>
  );
}
