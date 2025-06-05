"use client";

import Script from "next/script";

interface AdSenseProps {
  slot: string;
  style?: React.CSSProperties;
  className?: string;
}

export function AdSense({ slot, style, className }: AdSenseProps) {
  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        crossOrigin="anonymous"
      />
      <ins
        className={`adsbygoogle ${className}`}
        style={style}
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

export function TopAd() {
  return (
    <div className="w-full h-[90px] bg-muted/30 flex items-center justify-center">
      <AdSense
        slot="top-ad"
        className="block"
        style={{ display: "block", minHeight: "90px" }}
      />
    </div>
  );
}

export function SideAd() {
  return (
    <div className="w-full h-[600px] bg-muted/30 flex items-center justify-center">
      <AdSense
        slot="side-ad"
        className="block"
        style={{ display: "block", minHeight: "600px" }}
      />
    </div>
  );
}

export function InFeedAd() {
  return (
    <div className="w-full h-[200px] bg-muted/30 flex items-center justify-center">
      <AdSense
        slot="in-feed-ad"
        className="block"
        style={{ display: "block", minHeight: "200px" }}
      />
    </div>
  );
}