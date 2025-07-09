"use client";

import Script from "next/script";
import { AdSenseProps } from "@rubros/types";
import { useEffect, useState } from "react";
import { canUseAdvertising, getCurrentConsent } from "@/lib/cookies";

export function AdSense({ slot, style, className }: AdSenseProps) {
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
    ...style,
    maxWidth: "1100px",
  };

  // No renderizar hasta que se cargue el estado del consentimiento
  /* if (!isLoaded) {
     return (
       <div className={`${className} max-w-[1100px] flex items-center justify-center bg-muted/30`} style={parsedStyle}>
         <div className="text-sm text-muted-foreground">Cargando...</div>
       </div>
     );
   } */

  // Si no hay consentimiento, mostrar mensaje
  /*if (!hasConsent) {
    return (
      <div className={`${className} max-w-[1100px] flex flex-col items-center justify-center bg-muted/30 p-4 border-2 border-dashed border-muted-foreground/30`} style={parsedStyle}>
        <div className="text-center space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Anuncio bloqueado</div>
          <div className="text-xs text-muted-foreground">
            Acepta las cookies de publicidad para ver anuncios relevantes
          </div>
        </div>
      </div>
    );
  } */

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        crossOrigin="anonymous"
      />
      <ins
        className={`adsbygoogle ${className} max-w-[1100px]`}
        style={parsedStyle}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
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

export function TopAd(props: Omit<AdSenseProps, "slot">) {
  const defaultProps = {
    className: props.className || "block",
    style: props.style || { display: "block", minHeight: "90px" },
  }

  return (
    <div className="w-full h-[90px] bg-muted/30 flex items-center justify-center">
      <AdSense
        slot="top-ad"
        {...defaultProps}
      />
    </div>
  );
}

export function SideAd(props: Omit<AdSenseProps, "slot">) {
  const defaultProps = {
    className: props.className || "block",
    style: props.style || { display: "block", minHeight: "600px" },
  }
  return (
    <div className="w-full h-[600px] bg-muted/30 flex items-center justify-center">
      <AdSense
        slot="side-ad"
        {...defaultProps}
      />
    </div>
  );
}

export function InFeedAd(props: Omit<AdSenseProps, "slot">) {
  const defaultProps = {
    className: props.className || "block",
    style: props.style || { display: "block", minHeight: "200px" },
  }
  return (
    <div className="w-full h-[200px] bg-muted/30 flex items-center justify-center">
      <AdSense
        slot="in-feed-ad"
        {...defaultProps}
      />
    </div>
  );
}