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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Cargar consentimiento inicial
    setConsent(getCurrentConsent());
    setIsLoaded(true);

    // Escuchar cambios en el consentimiento
    const handleConsentChange = (event: CustomEvent) => {
      setConsent(event.detail as CookieConsent);
    };

    window.addEventListener(
      'cookieConsentChanged',
      handleConsentChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'cookieConsentChanged',
        handleConsentChange as EventListener
      );
    };
  }, []);

  return {
    consent,
    isLoaded,
    canUseAnalytics: isLoaded ? canUseAnalytics() : false,
    canUseAdvertising: isLoaded ? canUseAdvertising() : false,
    hasNecessary: consent?.necessary ?? true,
    hasAnalytics: consent?.analytics ?? false,
    hasAdvertising: consent?.advertising ?? false,
  };
}
