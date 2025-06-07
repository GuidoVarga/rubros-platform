"use client";

import { TopAd, SideAd, InFeedAd } from "./adsense";
import { MockTopAd, MockSideAd, MockInFeedAd, MockSquareAd, MockFooterAd } from "@rubros/ui";

const isDevelopment = process.env.NODE_ENV === "development";

export function AdComponent({ type }: { type: "top" | "side" | "in-feed" | "square" | "footer" }) {
  if (isDevelopment) {
    switch (type) {
      case "top":
        return <MockTopAd />;
      case "side":
        return <MockSideAd />;
      case "in-feed":
        return <MockInFeedAd />;
      case "square":
        return <MockSquareAd />;
      case "footer":
        return <MockFooterAd />;
    }
  }

  switch (type) {
    case "top":
      return <TopAd />;
    case "side":
      return <SideAd />;
    case "in-feed":
    case "square":
    case "footer":
      return <InFeedAd />;
  }
}