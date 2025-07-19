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

  // Track pageviews only if consent is given
  useEffect(() => {
    if (pathname && hasAnalyticsConsent) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      pageview(url);
    }
  }, [pathname, searchParams, hasAnalyticsConsent]);

  // Don't render GA if no consent, no tracking ID, or not production
  if (!hasAnalyticsConsent || !GA_TRACKING_ID || process.env.NODE_ENV !== 'production') {
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
              page_location: window.location.href,
              page_title: document.title,
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