'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { pageview, GA_TRACKING_ID } from '@/lib/analytics';
import { canUseAnalytics, getCurrentConsent } from '@/lib/cookies';

function GoogleAnalyticsComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);
  const [gaReady, setGaReady] = useState(false);

  // Check consent on mount and listen for changes
  useEffect(() => {
    const checkConsent = () => {
      setHasAnalyticsConsent(canUseAnalytics());
    };

    // Check initial consent
    checkConsent();

    // Listen for consent changes
    const handleConsentChange = () => {
      checkConsent();
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);
    return () => window.removeEventListener('cookieConsentChanged', handleConsentChange);
  }, []);

  // Wait for Google Analytics to be ready
  useEffect(() => {
    if (!hasAnalyticsConsent) return;

    const checkGAReady = () => {
      if (typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function') {
        setGaReady(true);
        return true;
      }
      return false;
    };

    if (!checkGAReady()) {
      const interval = setInterval(() => {
        if (checkGAReady()) {
          clearInterval(interval);
        }
      }, 100);

      // Cleanup after 10 seconds to avoid infinite polling
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [hasAnalyticsConsent]);

  // Track pageviews only if consent is given and GA is ready
  useEffect(() => {
    if (pathname && hasAnalyticsConsent && gaReady) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      console.log('🔄 GA Ready - Tracking pageview:', url);
      pageview(url);
    }
  }, [pathname, searchParams, hasAnalyticsConsent, gaReady]);

  // Debug info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 GA Debug:', {
      hasConsent: hasAnalyticsConsent,
      trackingId: GA_TRACKING_ID,
      gaReady: gaReady,
      currentPath: pathname
    });
  }

  // Don't render GA if no consent or no tracking ID
  if (!hasAnalyticsConsent || !GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              send_page_view: false,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          `,
        }}
      />
    </>
  );
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsComponent />
    </Suspense>
  );
}