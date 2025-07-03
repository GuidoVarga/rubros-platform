"use client";

import Script from "next/script";
import { AdSenseProps } from "@rubros/types";

export function AdSense({ slot, style, className }: AdSenseProps) {
  const parsedStyle = {
    ...style,
    maxWidth: "1100px",
  }
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