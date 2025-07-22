"use client";

import Script from "next/script";
import { AdSenseProps } from "@rubros/types";
import { useEffect, useState, useRef } from "react";
import { canUseAdvertising } from "@/lib/cookies";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

type AdSenseComponentProps = Omit<AdSenseProps, "slot"> & {
  slot: string;
};

export function AdSenseComponent({ slot, style, className }: AdSenseComponentProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [adPushed, setAdPushed] = useState(false);
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Verificar consentimiento inicial
    setHasConsent(canUseAdvertising());
    setIsLoaded(true);

    // Escuchar cambios en el consentimiento
    const handleConsentChange = () => {
      setHasConsent(canUseAdvertising());
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);
    return () => window.removeEventListener('cookieConsentChanged', handleConsentChange);
  }, []);

  useEffect(() => {
    if (!hasConsent || !isLoaded || adPushed) return;

    // Esperar a que el elemento tenga dimensiones y el script esté cargado
    const checkAndPushAd = () => {
      if (adRef.current && window.adsbygoogle) {
        const rect = adRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdPushed(true);
          } catch (error) {
            console.error('Error pushing ad:', error);
            // Retry after error
            setTimeout(checkAndPushAd, 1000);
          }
        } else {
          // Retry after a short delay if element has no width
          setTimeout(checkAndPushAd, 200);
        }
      } else if (!window.adsbygoogle) {
        // Script not loaded yet, retry
        setTimeout(checkAndPushAd, 500);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(checkAndPushAd, 300);
    return () => clearTimeout(timer);
  }, [hasConsent, isLoaded, adPushed]);

  const parsedStyle = {
    display: 'block',
    width: '100%',
    minWidth: '300px',
    minHeight: style?.minHeight || '100px',
    ...style,
    maxWidth: "1100px",
  };

  if (!hasConsent) {
    return null;
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className || ''}`}
      style={parsedStyle}
      data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}