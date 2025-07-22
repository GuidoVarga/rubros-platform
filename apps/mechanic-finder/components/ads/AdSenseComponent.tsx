"use client";

import Script from "next/script";
import { AdSenseProps } from "@rubros/types";
import { useEffect, useState } from "react";
import { canUseAdvertising } from "@/lib/cookies";

type AdSenseComponentProps = Omit<AdSenseProps, "slot"> & {
  slot: string;
};

export function AdSenseComponent({ slot, style, className }: AdSenseComponentProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const parsedStyle = {
    width: "100%",
    ...style,
    maxWidth: "1100px",
  };

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
        crossOrigin="anonymous"
      />
      <ins
        className={`adsbygoogle ${className} max-w-[1100px]`}
        style={parsedStyle}
        data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`ad-${slot}`}>
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </>
  );
}