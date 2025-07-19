'use client';

import { useState, useEffect } from 'react';
import {
  getCurrentConsent,
  canUseAnalytics,
  canUseAdvertising,
  type CookieConsent,
} from '@/lib/cookies';

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);
  const [hasAdvertisingConsent, setHasAdvertisingConsent] = useState(false);

  useEffect(() => {
    const updateConsent = () => {
      const currentConsent = getCurrentConsent();
      setConsent(currentConsent);
      setHasAnalyticsConsent(canUseAnalytics());
      setHasAdvertisingConsent(canUseAdvertising());
    };

    // Initial check
    updateConsent();

    // Listen for changes
    const handleConsentChange = () => {
      updateConsent();
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);
    return () =>
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
  }, []);

  return {
    consent,
    hasAnalyticsConsent,
    hasAdvertisingConsent,
    canUseAnalytics: hasAnalyticsConsent,
    canUseAdvertising: hasAdvertisingConsent,
  };
}
