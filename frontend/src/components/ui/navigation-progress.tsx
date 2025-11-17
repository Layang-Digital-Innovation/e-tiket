'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/store/navigation/useNavigationStore';

export default function NavigationProgress({className}: {className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const completeTimeout = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  const { isNavigating, progress, startNavigation, setProgress, finishNavigation, resetNavigation } = useNavigationStore();

  // Intercept all link clicks to start loading immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.target && link.href.startsWith(window.location.origin)) {
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
    // Skip on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Clear any existing timers
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    if (completeTimeout.current) {
      clearTimeout(completeTimeout.current);
    }

    // Check when page is actually loaded
    const checkPageLoad = () => {
      if (document.readyState === 'complete') {
        // Page is fully loaded
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
        finishNavigation();
        
        completeTimeout.current = setTimeout(() => {
          resetNavigation();
        }, 200);
      } else {
        // Keep checking
        setTimeout(checkPageLoad, 50);
      }
    };

    // Start checking immediately
    checkPageLoad();

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
      className="fixed top-14 left-0 right-0 z-50 h-[0.5px] bg-transparent"
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
