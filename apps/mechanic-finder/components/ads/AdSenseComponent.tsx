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
  const [error, setError] = useState<string | null>(null);
  const adRef = useRef<HTMLElement>(null);

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
    if (!hasConsent || !isLoaded || adPushed || error) return;

    let retryCount = 0;
    const maxRetries = 10;

    const checkAndPushAd = () => {
      const element = adRef.current;

      if (!element) {
        setError('AdSense element not found in DOM');
        return;
      }

      if (!window.adsbygoogle) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkAndPushAd, 500);
        } else {
          setError('AdSense script not loaded after retries');
        }
        return;
      }

      // Verificar que el elemento esté en el DOM y sea visible
      const rect = element.getBoundingClientRect();
      const isInViewport = element.offsetParent !== null;
      const hasSize = rect.width > 0 && rect.height > 0;

      if (!isInViewport) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkAndPushAd, 200);
        } else {
          setError('AdSense element not visible after retries');
        }
        return;
      }

      if (!hasSize) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkAndPushAd, 200);
        } else {
          setError('AdSense element has no size after retries');
        }
        return;
      }

      // Todo listo, push del ad
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdPushed(true);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(`Push failed: ${errorMessage}`);

        // Retry once more after error
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkAndPushAd, 1000);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(checkAndPushAd, 300);
    return () => clearTimeout(timer);
  }, [hasConsent, isLoaded, adPushed, error, slot]);

  const parsedStyle = {
    display: 'block',
    width: '100%',
    minWidth: '300px',
    minHeight: style?.minHeight || '250px', // Increased min height
    height: 'auto',
    overflow: 'hidden',
    ...style,
    maxWidth: "1100px",
  };

  if (!hasConsent) {
    return null;
  }

  // Debug mode in development
  if (error && process.env.NODE_ENV === 'development') {
    return (
      <div
        style={parsedStyle}
        className={`border-2 border-red-300 bg-red-50 p-4 rounded ${className || ''}`}
      >
        <div className="text-red-700 text-sm">
          <strong>AdSense Error (slot: {slot}):</strong><br />
          {error}
        </div>
        <button
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-xs"
          onClick={() => {
            setError(null);
            setAdPushed(false);
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ins
      ref={adRef as any}
      className={`adsbygoogle ${className || ''}`}
      style={parsedStyle}
      data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      data-adtest={process.env.NODE_ENV === 'development' ? 'on' : undefined}
    />
  );
}